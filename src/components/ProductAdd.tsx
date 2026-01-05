import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  category: z.string().min(1, 'Category is required'),
  manufacturingDate: z.string().min(1, 'Manufacturing date is required'),
  currentLocation: z.string().min(1, 'Current location is required'),
  currentStock: z.number().min(0, 'Stock must be non-negative'),
  expiryDate: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductAddProps {
  onProductAdded?: () => void;
}

export default function ProductAdd({ onProductAdded }: ProductAddProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      currentStock: 0,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const productId = uuidv4();
      const productData = {
        id: productId,
        ...data,
        currentStatus: 'manufactured' as const,
        authenticity: true,
        events: [
          {
            id: uuidv4(),
            status: 'manufactured' as const,
            timestamp: Date.now(),
            location: data.currentLocation,
            stakeholder: data.manufacturer,
            stakeholderType: 'manufacturer' as const,
            data: {
              temperature: null,
              humidity: null,
            },
            hash: 'initial-hash', // In real app, calculate hash
          },
        ],
      };

      await addDoc(collection(db, 'products'), productData);

      toast({
        title: 'Product Added',
        description: `${data.name} has been added to the database.`,
      });

      reset();
      setOpen(false);
      onProductAdded?.();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: `Failed to add product: ${error.message || 'Unknown error'}. Please check Firebase configuration.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Product</DialogTitle>
          <DialogDescription className="text-slate-300">
            Enter the product details to add it to the supply chain database.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Product Name</Label>
              <Input
                id="name"
                {...register('name')}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNumber" className="text-white">Batch Number</Label>
              <Input
                id="batchNumber"
                {...register('batchNumber')}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Enter batch number"
              />
              {errors.batchNumber && <p className="text-red-400 text-sm">{errors.batchNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer" className="text-white">Manufacturer</Label>
              <Input
                id="manufacturer"
                {...register('manufacturer')}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Enter manufacturer"
              />
              {errors.manufacturer && <p className="text-red-400 text-sm">{errors.manufacturer.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Category</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-400 text-sm">{errors.category.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturingDate" className="text-white">Manufacturing Date</Label>
              <Input
                id="manufacturingDate"
                type="date"
                {...register('manufacturingDate')}
                className="bg-slate-800 border-slate-600 text-white"
              />
              {errors.manufacturingDate && <p className="text-red-400 text-sm">{errors.manufacturingDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentLocation" className="text-white">Current Location</Label>
              <Input
                id="currentLocation"
                {...register('currentLocation')}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Enter current location"
              />
              {errors.currentLocation && <p className="text-red-400 text-sm">{errors.currentLocation.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock" className="text-white">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                {...register('currentStock', { valueAsNumber: true })}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="0"
              />
              {errors.currentStock && <p className="text-red-400 text-sm">{errors.currentStock.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-white">Expiry Date (Optional)</Label>
              <Input
                id="expiryDate"
                type="date"
                {...register('expiryDate')}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-600 text-white hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
