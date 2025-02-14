const stripe = require('stripe')('sk_test_51QCkmz03CyqWPRusF1gu2EgcKBaLFXIB4ev9yy2oy9trS4fzWLLBKt8lgSUVTEIPTCJD8fFqFsnCToqMlpatO6VC002smoHM5J');

const CUSTOMERS = [];

const sendInvoice = async function (email, amount, currency = 'usd') {
  let customer = CUSTOMERS.find(c => c.email === email);
  let customerId;

  if (!customer) {
    // Create a new Customer
    customer = await stripe.customers.create({
      email,
      description: 'Customer to invoice',
    });
    CUSTOMERS.push({ stripeId: customer.id, email: email });
    customerId = customer.id;
  } else {
    customerId = customer.stripeId;
  }

  // Dynamically create a Price
  const price = await stripe.prices.create({
    unit_amount: amount, // Amount in cents
    currency: currency,
    product_data: {
      name: 'Custom Service',
    },
  });

  // Create an Invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    days_until_due: 30,
  });

  // Create an Invoice Item with the dynamically created Price
  await stripe.invoiceItems.create({
    customer: customerId,
    price: price.id,
    invoice: invoice.id,
  });

  // Send the Invoice
  await stripe.invoices.sendInvoice(invoice.id);
};

// Example usage: send an invoice of $50 USD
sendInvoice("mwfarrukh@gmail.com", 5000);
