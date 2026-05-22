package com.example.civiomobile.data.api.dto

data class OrganizationResponse(
    val id: String,
    val ownerUserId: String,
    val name: String,
    val status: String,
    val city: String,
    val address: String,
    val description: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val website: String? = null,
    val createdAt: String
)

data class ServiceResponse(
    val id: String,
    val organizationId: String,
    val categoryId: String? = null,
    val name: String,
    val description: String? = null,
    val durationMinutes: Int,
    val price: Double? = null,
    val isActive: Boolean,
    val createdAt: String
)
