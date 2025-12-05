export const calculateTotal = (items) => {
  return items.reduce((total, item) => total + Number(item.price) * Number(item.quantity || 1), 0);
};

export const formatCurrency = (value) => {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `R${amount.toFixed(2)}`;
};

export const sumQuantities = (items) =>
  items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
