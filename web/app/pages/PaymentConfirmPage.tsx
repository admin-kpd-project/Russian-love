import { CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function PaymentConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const shortOrderId = useMemo(() => {
    if (!orderId) return "";
    return orderId.length > 12 ? `${orderId.slice(0, 12)}...` : orderId;
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle2 className="size-10 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Платеж создан</h1>
        <p className="text-gray-600 mb-2">
          Заказ передан в обработку. Статус обновится автоматически после ответа платежного провайдера.
        </p>
        {shortOrderId && <p className="text-sm text-gray-500 mb-6">Order ID: {shortOrderId}</p>}
        <button
          onClick={() => navigate("/app")}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          Вернуться в приложение
        </button>
      </div>
    </div>
  );
}
