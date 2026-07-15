import {
  IconToolsKitchen2,
  IconCar,
  IconShoppingBag,
  IconReceipt2,
  IconTag,
  IconHelp,
} from "@tabler/icons-react";

export function getCategoryIcon(category: string) {
  switch (category?.toLowerCase()) {
    case "dining out":
    case "comida fuera":
    case "almuerzo":
    case "comida":
      return <IconToolsKitchen2 className="w-5 h-5 text-amber-600" />;
    case "transport":
    case "transporte":
    case "uber":
      return <IconCar className="w-5 h-5 text-blue-600" />;
    case "groceries":
    case "supermercado":
      return <IconShoppingBag className="w-5 h-5 text-emerald-600" />;
    case "bills":
    case "facturas":
    case "servicios":
      return <IconReceipt2 className="w-5 h-5 text-purple-600" />;
    case "shopping":
    case "compras":
      return <IconTag className="w-5 h-5 text-pink-600" />;
    default:
      return <IconHelp className="w-5 h-5 text-gray-500" />;
  }
}
