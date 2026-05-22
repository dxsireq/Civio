package com.example.civiomobile.data.repository

import com.example.civiomobile.data.api.CivioApi
import com.example.civiomobile.data.api.dto.OrganizationResponse
import com.example.civiomobile.data.api.dto.ServiceResponse
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrganizationRepository @Inject constructor(
    private val api: CivioApi
) {
    suspend fun catalog(city: String? = null): List<OrganizationResponse> =
        api.getCatalog(city)

    suspend fun organization(id: String): OrganizationResponse =
        api.getOrganization(id)

    suspend fun services(orgId: String): List<ServiceResponse> =
        api.getOrganizationServices(orgId)
}
