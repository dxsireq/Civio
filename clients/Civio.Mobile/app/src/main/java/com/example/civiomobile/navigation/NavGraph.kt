package com.example.civiomobile.navigation

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import androidx.navigation.navigation
import com.example.civiomobile.ui.screens.BookServiceScreen
import com.example.civiomobile.ui.screens.BookingDetailScreen
import com.example.civiomobile.ui.screens.BookingsScreen
import com.example.civiomobile.ui.screens.ConfirmBookingScreen
import com.example.civiomobile.ui.screens.LoginScreen
import com.example.civiomobile.ui.screens.NotificationsScreen
import com.example.civiomobile.ui.screens.OrganizationDetailScreen
import com.example.civiomobile.ui.screens.OrganizationsScreen
import com.example.civiomobile.ui.screens.ProfileScreen
import com.example.civiomobile.ui.screens.QrCodeScreen
import com.example.civiomobile.ui.screens.RegisterScreen
import com.example.civiomobile.ui.screens.SelectSlotScreen
import com.example.civiomobile.viewmodel.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CivioNavGraph(
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val navController = rememberNavController()
    val startDestination = if (authViewModel.isAuthenticated()) {
        Routes.MAIN_GRAPH
    } else {
        Routes.AUTH_GRAPH
    }

    LaunchedEffect(Unit) {
        authViewModel.logoutSignal.collect {
            navController.navigate(Routes.AUTH_GRAPH) {
                popUpTo(navController.graph.id) { inclusive = true }
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        authGraph(navController)
        mainGraph(navController, authViewModel)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
private fun NavGraphBuilder.authGraph(navController: NavHostController) {
    navigation(
        route = Routes.AUTH_GRAPH,
        startDestination = Routes.LOGIN
    ) {
        composable(Routes.LOGIN) {
            LoginScreen(
                onLoggedIn = {
                    navController.navigate(Routes.MAIN_GRAPH) {
                        popUpTo(Routes.AUTH_GRAPH) { inclusive = true }
                    }
                },
                onNavigateRegister = { navController.navigate(Routes.REGISTER) }
            )
        }
        composable(Routes.REGISTER) {
            RegisterScreen(
                onLoggedIn = {
                    navController.navigate(Routes.MAIN_GRAPH) {
                        popUpTo(Routes.AUTH_GRAPH) { inclusive = true }
                    }
                },
                onNavigateLogin = { navController.popBackStack() }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
private fun NavGraphBuilder.mainGraph(
    rootNavController: NavHostController,
    authViewModel: AuthViewModel
) {
    composable(Routes.MAIN_GRAPH) {
        MainScaffold(
            onLogout = {
                authViewModel.logout()
                rootNavController.navigate(Routes.AUTH_GRAPH) {
                    popUpTo(rootNavController.graph.id) { inclusive = true }
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainScaffold(onLogout: () -> Unit) {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route

    val showBottomBar = BottomNavItems.any { it.route == currentRoute }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    BottomNavItems.forEach { item ->
                        NavigationBarItem(
                            selected = currentRoute == item.route,
                            onClick = {
                                if (currentRoute != item.route) {
                                    navController.navigate(item.route) {
                                        popUpTo(Routes.CATALOG) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label) }
                        )
                    }
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Routes.CATALOG,
            modifier = Modifier.padding(padding)
        ) {
            composable(Routes.CATALOG) {
                OrganizationsScreen(onOpenOrg = { id ->
                    navController.navigate(Routes.orgDetail(id))
                })
            }
            composable(
                route = Routes.ORG_DETAIL,
                arguments = listOf(navArgument("orgId") { type = NavType.StringType })
            ) { entry ->
                val orgId = entry.arguments?.getString("orgId").orEmpty()
                OrganizationDetailScreen(
                    orgId = orgId,
                    onBook = { navController.navigate(Routes.bookService(orgId)) }
                )
            }
            composable(
                route = Routes.BOOK_SERVICE,
                arguments = listOf(navArgument("orgId") { type = NavType.StringType })
            ) { entry ->
                val orgId = entry.arguments?.getString("orgId").orEmpty()
                BookServiceScreen(
                    orgId = orgId,
                    onContinue = { navController.navigate(Routes.selectSlot(orgId)) }
                )
            }
            composable(
                route = Routes.SELECT_SLOT,
                arguments = listOf(navArgument("orgId") { type = NavType.StringType })
            ) { entry ->
                val orgId = entry.arguments?.getString("orgId").orEmpty()
                SelectSlotScreen(
                    orgId = orgId,
                    onContinue = { navController.navigate(Routes.confirm(orgId)) }
                )
            }
            composable(
                route = Routes.CONFIRM,
                arguments = listOf(navArgument("orgId") { type = NavType.StringType })
            ) { entry ->
                val orgId = entry.arguments?.getString("orgId").orEmpty()
                ConfirmBookingScreen(
                    orgId = orgId,
                    onConfirmed = { bookingId ->
                        navController.navigate(Routes.bookingDetail(bookingId)) {
                            popUpTo(Routes.CATALOG)
                        }
                    }
                )
            }
            composable(Routes.BOOKINGS) {
                BookingsScreen(onOpenBooking = { id ->
                    navController.navigate(Routes.bookingDetail(id))
                })
            }
            composable(
                route = Routes.BOOKING_DETAIL,
                arguments = listOf(navArgument("bookingId") { type = NavType.StringType })
            ) { entry ->
                val bookingId = entry.arguments?.getString("bookingId").orEmpty()
                BookingDetailScreen(
                    bookingId = bookingId,
                    onShowQr = { navController.navigate(Routes.qrCode(bookingId)) }
                )
            }
            composable(
                route = Routes.QR_CODE,
                arguments = listOf(navArgument("bookingId") { type = NavType.StringType })
            ) { entry ->
                val bookingId = entry.arguments?.getString("bookingId").orEmpty()
                QrCodeScreen(bookingId = bookingId)
            }
            composable(Routes.NOTIFICATIONS) { NotificationsScreen() }
            composable(Routes.PROFILE) { ProfileScreen(onLogout = onLogout) }
        }
    }
}
