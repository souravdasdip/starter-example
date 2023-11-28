'use server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

//CREATE INVOICE ZOD SCHEME
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });

//CREATE INVOICE FUNCTION
export async function createInvoice(formData: FormData) {
  //   const rawFormData = {
  //     customerId: formData.get('customerId'),
  //     amout: formData.get('amount'),
  //     status: formData.get('status'),
  //   };

  //   const rawFormData = Object.fromEntries(formData.entries());
  //   console.log(rawFormData);

  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  console.log(`${customerId}, ${amountInCents}, ${status}, ${date}`);

  //To database
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES(${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  //TO REVALIDATE INVOICES PAGE
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
