from django.db.models import Count, Sum
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from users.permissions import IsAdminUserType
from users.models import VendorApplication
from services.models import Service, Order, Review
from bookings.models import Booking
from payments.models import Payment


User = get_user_model()


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def admin_dashboard(request):
    """
    Aggregate platform metrics for the admin dashboard.
    """
    # Users
    total_users = User.objects.count()
    users_by_type = User.objects.values("user_type").annotate(count=Count("id"))
    users_map = {row["user_type"]: row["count"] for row in users_by_type}

    # Services
    total_services = Service.objects.count()
    services_by_category = (
        Service.objects.values("category").annotate(count=Count("id")).order_by("category")
    )

    # Orders
    total_orders = Order.objects.count()
    orders_by_status = Order.objects.values("order_status").annotate(count=Count("id"))

    # Bookings
    total_bookings = Booking.objects.count()
    bookings_by_status = Booking.objects.values("status").annotate(count=Count("id"))

    # Payments
    total_payments = Payment.objects.count()
    payments_by_status = Payment.objects.values("status").annotate(count=Count("id"))
    successful_revenue = (
        Payment.objects.filter(status="successful").aggregate(total=Sum("amount"))[["total"]]
        if total_payments
        else {"total": 0}
    )
    successful_revenue = Payment.objects.filter(status="successful").aggregate(total=Sum("amount"))

    # Reviews
    total_reviews = Review.objects.count()

    # Vendor applications
    total_vendor_apps = VendorApplication.objects.count()
    vendor_apps_by_status = (
        VendorApplication.objects.values("status").annotate(count=Count("id"))
    )

    return Response(
        {
            "users": {
                "total": total_users,
                "students": users_map.get("student", 0),
                "vendors": users_map.get("vendor", 0),
                "admins": users_map.get("admin", 0),
            },
            "services": {
                "total": total_services,
                "by_category": list(services_by_category),
            },
            "orders": {
                "total": total_orders,
                "by_status": list(orders_by_status),
            },
            "bookings": {
                "total": total_bookings,
                "by_status": list(bookings_by_status),
            },
            "payments": {
                "total": total_payments,
                "by_status": list(payments_by_status),
                "successful_revenue": successful_revenue.get("total") or 0,
            },
            "reviews": {"total": total_reviews},
            "vendor_applications": {
                "total": total_vendor_apps,
                "by_status": list(vendor_apps_by_status),
            },
        },
        status=status.HTTP_200_OK,
    )

