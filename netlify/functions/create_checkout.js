const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { cart } = JSON.parse(event.body);

    // Проверяем, что корзина не пустая
    if (!cart || cart.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Cart is empty' })
      };
    }

    // Формируем line_items из корзины
    const line_items = cart.map(item => ({
      price: item.priceId,     // Price ID из Stripe
      quantity: item.quantity
    }));

    // Создаём сессию Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: 'https://barbershopltd.online/success.html',
      cancel_url: 'https://barbershopltd.online/cart.html'
    });

    // Возвращаем URL сессии
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};