import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  CreditCardIcon,
  UserIcon,
  EnvelopeIcon,
  BanknotesIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

const schema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(50, { message: 'Full name must be less than 50 characters' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Full name can only contain letters and spaces' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .min(5, { message: 'Email must be at least 5 characters' }),
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'PAN must be in format: ABCDE1234F' })
    .length(10, { message: 'PAN must be exactly 10 characters' }),
  income: z
    .number()
    .min(50000, { message: 'Minimum annual income is ₹50,000' })
    .max(10000000, { message: 'Maximum annual income is ₹1,00,00,000' }),
  product: z.union([z.literal('Silver'), z.literal('Gold'), z.literal('Platinum')])
  .or(z.literal('')) // only if you have empty default — remove if not
  .refine((v) => v === 'Silver' || v === 'Gold' || v === 'Platinum', {
    message: 'Please select a card product'
  }),
  document: z
    .any()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0]?.size <= 5_000_000,
      { message: 'File size must be less than 5MB' }
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ['image/jpeg', 'image/png', 'application/pdf'].includes(files[0]?.type),
      { message: 'Only JPEG, PNG, and PDF files are allowed' }
    ),
});


type FormData = z.infer<typeof schema>;

interface ApplyCardFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ApplyCardForm({ onSubmit, isSubmitting = false }: ApplyCardFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      pan: '',
      income: 0,
      product: '',
      document: undefined,
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    console.log('[ApplyCardForm] submit called, form values:', {
      fullName: data.fullName,
      email: data.email,
      pan: data.pan,
      product: data.product,
      hasFile: !!(data.document && (data.document as any).length > 0),
    });
    await onSubmit(data); // forward to the real onSubmit
  };

  const docErrorMsg = (() => {
    const m = errors.document?.message;
    if (!m) return undefined;
    if (typeof m === 'string') return m;
    if (typeof m === 'object' && 'message' in m) return String((m as any).message);
    return String(m);
  })();

  const selectedProduct = watch('product');

  const productFeatures = {
    Silver: ['5% cashback on groceries', 'No annual fee first year', '₹50,000 credit limit'],
    Gold: ['10% cashback on dining', '₹500 annual fee waived', '₹2,00,000 credit limit'],
    Platinum: ['15% cashback on travel', 'Complimentary lounge access', '₹5,00,000 credit limit'],
  };

  const formatPAN = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
  };

  const [isPanFocused, setIsPanFocused] = React.useState(false);
  
  const maskPAN = (value: string) => {
    if (!value) return '';
    if (isPanFocused || value.length <= 4) return value;
    return value.substring(0, 4) + 'X'.repeat(Math.min(4, value.length - 4)) + (value.length > 8 ? value.substring(8) : '');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 sm:space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Apply for Credit Card
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Get instant approval with our quick application process
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <UserIcon className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              {...register('fullName')}
              type="text"
              placeholder="Enter your full name"
              className={clsx(
                'w-full px-4 py-2 sm:py-3 rounded border transition-all duration-200',
                'bg-white dark:bg-gray-900',
                'placeholder-gray-400 dark:placeholder-gray-500',
                'text-gray-900 dark:text-white',
                errors.fullName
                  ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500'
              )}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="Enter your email address"
              className={clsx(
                'w-full px-4 py-3 rounded border transition-all duration-200',
                'bg-white dark:bg-gray-900',
                'placeholder-gray-400 dark:placeholder-gray-500',
                'text-gray-900 dark:text-white',
                errors.email
                  ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500'
              )}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PAN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DocumentIcon className="w-4 h-4 inline mr-2" />
              PAN Number
            </label>
            <Controller
              name="pan"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <input
                  {...field}
                  type="text"
                  value={value || ''}
                  onChange={(e) => onChange(formatPAN(e.target.value))}
                  onFocus={() => setIsPanFocused(true)}
                  onBlur={() => setIsPanFocused(false)}
                  placeholder="ABCDE1234F"
                  className={clsx(
                    'w-full px-4 py-3 rounded border transition-all duration-200',
                    'bg-white dark:bg-gray-900',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'text-gray-900 dark:text-white font-mono',
                    'tracking-widest',
                    errors.pan
                      ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500'
                  )}
                />
              )}
            />
            {errors.pan && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.pan.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F). The field will be masked when not in focus.
            </p>
          </div>

          {/* Annual Income */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <BanknotesIcon className="w-4 h-4 inline mr-2" />
              Annual Income (₹)
            </label>
            <input
              {...register('income', { valueAsNumber: true })}
              type="number"
              placeholder="500000"
              className={clsx(
                'w-full px-4 py-3 rounded border transition-all duration-200',
                'bg-white dark:bg-gray-900',
                'placeholder-gray-400 dark:placeholder-gray-500',
                'text-gray-900 dark:text-white',
                errors.income
                  ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500'
              )}
            />
            {errors.income && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.income.message}
              </p>
            )}
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DocumentIcon className="w-4 h-4 inline mr-2" />
              Income Proof (Optional)
            </label>
            <input
              {...register('document')}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className={clsx(
                'w-full px-4 py-3 rounded border transition-all duration-200',
                'bg-white dark:bg-gray-900',
                'text-gray-900 dark:text-white',
                'file:mr-4 file:py-2 file:px-4 file:rounded file:border-0',
                'file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700',
                'dark:file:bg-primary-900 dark:file:text-primary-400',
                'hover:file:bg-primary-100 dark:hover:file:bg-primary-800',
                errors.document
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            />
            {docErrorMsg && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {docErrorMsg}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Upload salary slip, ITR, or bank statement (Max 5MB, JPEG/PNG/PDF)
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Card Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              <CreditCardIcon className="w-4 h-4 inline mr-2" />
              Select Card Product
            </label>
            <div className="space-y-4">
              {(['Silver', 'Gold', 'Platinum'] as const).map((product) => (
                <motion.label
                  key={product}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    'block p-4 rounded border-2 cursor-pointer transition-all duration-200',
                    'bg-white dark:bg-gray-900',
                    selectedProduct === product
                      ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                  )}
                >
                  <input
                    {...register('product')}
                    type="radio"
                    value={product}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product} Card
                    </span>
                    <div className={clsx(
                      'w-4 h-4 rounded-full border-2 transition-all duration-200',
                      selectedProduct === product
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300 dark:border-gray-600'
                    )}>
                      {selectedProduct === product && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {productFeatures[product].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.label>
              ))}
            </div>
            {errors.product && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.product.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          className="flex-1 px-6 py-3 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Save & Continue Later
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 rounded bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
        >
          {isSubmitting ? 'Processing...' : 'Submit Application'}
        </motion.button>
      </div>
    </motion.form>
  );
}