package com.example.civiomobile.navigation

object Routes {
    const val AUTH_GRAPH = "auth"
    const val LOGIN = "login"
    const val REGISTER = "register"

    const val MAIN_GRAPH = "main"
    const val CATALOG = "catalog"
    const val ORG_DETAIL = "org/{orgId}"
    const val BOOK_SERVICE = "org/{orgId}/book"
    const val SELECT_SLOT = "org/{orgId}/slots"
    const val CONFIRM = "org/{orgId}/confirm"
    const val BOOKINGS = "bookings"
    const val BOOKING_DETAIL = "bookings/{bookingId}"
    const val QR_CODE = "bookings/{bookingId}/qr"
    const val NOTIFICATIONS = "notifications"
    const val PROFILE = "profile"

    fun orgDetail(orgId: String) = "org/$orgId"
    fun bookService(orgId: String) = "org/$orgId/book"
    fun selectSlot(orgId: String) = "org/$orgId/slots"
    fun confirm(orgId: String) = "org/$orgId/confirm"
    fun bookingDetail(bookingId: String) = "bookings/$bookingId"
    fun qrCode(bookingId: String) = "bookings/$bookingId/qr"
}
