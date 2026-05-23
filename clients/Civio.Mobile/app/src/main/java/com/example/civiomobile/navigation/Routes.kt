package com.example.civiomobile.navigation

object Routes {
    const val AUTH_GRAPH = "auth"
    const val LOGIN = "login"
    const val REGISTER = "register"

    const val MAIN_GRAPH = "main"
    const val CATALOG = "catalog"
    const val ORG_DETAIL = "org/{orgId}"
    const val BOOKING_GRAPH = "org/{orgId}/booking"
    const val BOOK_SERVICE = "org/{orgId}/booking/service"
    const val SELECT_SLOT = "org/{orgId}/booking/slot"
    const val CONFIRM = "org/{orgId}/booking/confirm"
    const val BOOKINGS = "bookings"
    const val BOOKING_DETAIL = "bookings/{bookingId}"
    const val QR_CODE = "bookings/{bookingId}/qr"
    const val NOTIFICATIONS = "notifications"
    const val PROFILE = "profile"

    fun orgDetail(orgId: String) = "org/$orgId"
    fun bookingGraph(orgId: String) = "org/$orgId/booking"
    fun bookService(orgId: String) = "org/$orgId/booking/service"
    fun selectSlot(orgId: String) = "org/$orgId/booking/slot"
    fun confirm(orgId: String) = "org/$orgId/booking/confirm"
    fun bookingDetail(bookingId: String) = "bookings/$bookingId"
    fun qrCode(bookingId: String) = "bookings/$bookingId/qr"
}
