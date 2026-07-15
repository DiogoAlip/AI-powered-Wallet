export function getCategoryBgColor(category: string) {
  switch (category?.toLowerCase()) {
    case "dining out":
    case "comida fuera":
    case "almuerzo":
      return "bg-amber-50 border-amber-200";
    case "transport":
    case "transporte":
    case "uber":
      return "bg-blue-50 border-blue-200";
    case "groceries":
    case "supermercado":
      return "bg-emerald-50 border-emerald-200";
    case "bills":
    case "facturas":
      return "bg-purple-50 border-purple-200";
    case "shopping":
    case "compras":
      return "bg-pink-50 border-pink-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}
