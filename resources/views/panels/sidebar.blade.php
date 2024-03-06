@php
$configData = Helper::applClasses();
@endphp
<div class="main-menu menu-fixed {{ $configData['theme'] === 'dark' || $configData['theme'] === 'semi-dark' ? 'menu-dark' : 'menu-light' }} menu-accordion menu-shadow"
    data-scroll-to-active="true">
    <div class="navbar-header">
        <ul class="nav navbar-nav flex-row">
            <li class="nav-item mr-auto" style="width: 65%">
                <a class="navbar-brand" href="{{ url('/') }}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 117.06 30.28">
                        <defs>
                            <style>
                                .cls-1 {
                                    fill: #00b2ff;
                                }

                                .cls-2 {
                                    fill: none;
                                }

                                .cls-3 {
                                    fill: #fff;
                                }

                                .cls-4 {
                                    fill: #fc0054;
                                }

                                .cls-5 {
                                    fill: #ffbc00;
                                }

                            </style>
                        </defs>
                        <g id="Layer_2" data-name="Layer 2">
                            <g id="Layer_1-2" data-name="Layer 1" class="brand-text">
                                <circle cx="114.79" cy="26.72" r="2.27" />
                                <path
                                    d="M54.17,27.34a10.36,10.36,0,0,1-14.46,0,9.81,9.81,0,0,1-3-7.26,10.09,10.09,0,0,1,10.2-10.2,10.09,10.09,0,0,1,10.2,10.2A9.81,9.81,0,0,1,54.17,27.34Zm-11.3-3.06a5.91,5.91,0,0,0,8.15,0,5.66,5.66,0,0,0,1.64-4.2A5.66,5.66,0,0,0,51,15.88a5.91,5.91,0,0,0-8.15,0,5.62,5.62,0,0,0-1.64,4.2A5.62,5.62,0,0,0,42.87,24.28Z" />
                                <path
                                    d="M80.26,15.88v14H76.05v-10H72.47v10H68.26v-10H64.62v10h-4.2v-10H58.54v-4h1.88a6,6,0,0,1,1.71-4.61q1.71-1.59,5.1-1.39v4c-1.74-.15-2.61.5-2.61,2h3.64V15.6q0-6,6.81-6a17.19,17.19,0,0,1,3.5.39v3.87a31.93,31.93,0,0,0-3.5-.22,3.72,3.72,0,0,0-1.94.4,1.68,1.68,0,0,0-.66,1.56v.28Z" />
                                <path
                                    d="M90.06,30.28a7.24,7.24,0,0,1-7.42-7.4,7.43,7.43,0,0,1,11.13-6.41,6.89,6.89,0,0,1,2.62,2.6L92.72,21.2A2.74,2.74,0,0,0,90,19.63a3.06,3.06,0,0,0-2.27.91,3.49,3.49,0,0,0,0,4.68,3,3,0,0,0,2.27.91,2.7,2.7,0,0,0,2.71-1.57l3.67,2.1a6.87,6.87,0,0,1-2.6,2.64A7.29,7.29,0,0,1,90.06,30.28Z" />
                                <path
                                    d="M101.55,24.56c.48,1.31,1.6,2,3.36,2a3.47,3.47,0,0,0,2.69-1.06L111,27.39a7,7,0,0,1-6.11,2.89,7.65,7.65,0,0,1-5.64-2.1,7.17,7.17,0,0,1-2.12-5.3,7.2,7.2,0,0,1,7.46-7.4,6.75,6.75,0,0,1,5.08,2.12,7.3,7.3,0,0,1,2,5.28,8.12,8.12,0,0,1-.16,1.68Zm-.09-3.14h6a2.79,2.79,0,0,0-3-2.21A2.85,2.85,0,0,0,101.46,21.42Z" />
                                <path
                                    d="M41.25,4.47A1.72,1.72,0,0,1,42,5.1a1.65,1.65,0,0,1,.27.94,1.82,1.82,0,0,1-.56,1.34,1.89,1.89,0,0,1-1.37.54H37.46V1.27h2.65a1.82,1.82,0,0,1,1.32.52A1.69,1.69,0,0,1,42,3.08,1.61,1.61,0,0,1,41.25,4.47ZM40.11,2.1H38.34v2h1.77a.94.94,0,0,0,.71-.3,1,1,0,0,0,.28-.72.94.94,0,0,0-.29-.71A.92.92,0,0,0,40.11,2.1Zm.21,5a1,1,0,0,0,.75-.31A1,1,0,0,0,41.38,6a1.07,1.07,0,0,0-.31-.76,1,1,0,0,0-.75-.31h-2V7.09Z" />
                                <path d="M47.36,1.27v.84h-2V7.92h-.87V2.11h-2V1.27Z" />
                                <path
                                    d="M49.67,7.92,47.76,1.27h.93l1.52,5.47,1.61-5.47h.89l1.62,5.47,1.52-5.47h.93L54.87,7.92h-1L52.27,2.61,50.69,7.92Z" />
                            </g>
                            <g id="Layer_1-2" data-name="Layer 1" class="brand-logo">
                                <rect class="cls-1" width="29.84" height="29.84" rx="2.9" />
                                <rect class="cls-2" width="29.84" height="29.84" rx="2.9" />
                                <path class="cls-3"
                                    d="M12.82,4.3A3.4,3.4,0,0,0,8.67,6.76l-6,23a2.4,2.4,0,0,0,.28,0H9.69L15.27,8.48A3.43,3.43,0,0,0,12.82,4.3Z" />
                                <path class="cls-4"
                                    d="M15.35,6.72a3.48,3.48,0,0,0-4.26-2.4A3.43,3.43,0,0,0,8.81,8.6l6.48,21.24h7.15Z" />
                                <path class="cls-5"
                                    d="M14.25,5a3.43,3.43,0,0,0-4.51,5.16l20,17.5a2.84,2.84,0,0,0,.1-.72V18.63Z" />
                            </g>

                        </g>
                    </svg>
                </a>
            </li>
            <li class="nav-item nav-toggle mt-50"><a class="nav-link modern-nav-toggle pr-0" data-toggle="collapse"><i
                        class="d-block d-xl-none text-primary toggle-icon font-medium-4" data-feather="x"></i><i
                        class="d-none d-xl-block collapse-toggle-icon font-medium-4  text-primary" data-feather="disc"
                        data-ticon="disc"></i></a></li>
        </ul>
    </div>
    <div class="shadow-bottom"></div>
    <div class="main-menu-content">
        <ul class="navigation navigation-main" id="main-menu-navigation" data-menu="menu-navigation">
            {{-- Foreach menu item starts --}}
            @if (isset($menuData[0]))
                @foreach ($menuData[0]->menu as $menu)
                    @php
                        $allowedSidebar = \App\Helpers\UserRole::getAllowed('roles.sidebar');
                        $availableSidebar = config('roles.sidebar.available');

                        $user = Auth::user();
                        $userRoles = $user->roles;
                        $userResources = $user->resources;

                        $allowedMenu = [];
                        $guardedMenu = [];
                        foreach ($userRoles as $role) {
                            $roleAllowedMenu = isset($menuData[0]->roles->{$role}->allowed) ? $menuData[0]->roles->{$role}->allowed : [];
                            $roleGuardedMenu = isset($menuData[0]->roles->{$role}->guarded) ? $menuData[0]->roles->{$role}->guarded : [];

                            $allowedMenu = array_merge($allowedMenu, $roleAllowedMenu);
                            $guardedMenu = array_merge($guardedMenu, $roleGuardedMenu);
                        }
                    @endphp
                    @if (
                        isset($menu->navheader) &&
                        (
                          ($allowedMenu && in_array($menu->slug, $allowedMenu)) ||
                          (!$allowedMenu && $guardedMenu && !in_array($menu->slug, $guardedMenu)) ||
                          ($guardedMenu && !in_array($menu->slug, $guardedMenu)) ||
                          (in_array('*', $allowedMenu) && in_array('*', $guardedMenu)) ||
                          count(array_intersect([$menu->slug], $allowedSidebar)) ||
                          count(array_intersect(['office_v2.sidebar.' . $menu->slug], $userResources)) ||
                          (count(array_intersect(['*'], $allowedSidebar)) && count(array_intersect([$menu->slug], $availableSidebar)))
                        )
                      )
                        <li class="navigation-header">
                            <span>{{ $menu->navheader }}</span>
                            <i data-feather="more-horizontal"></i>
                        </li>
                    @else
                        {{-- Add Custom Class with nav-item --}}
                        @php
                            $custom_classes = '';
                            if (isset($menu->classlist)) {
                                $custom_classes = $menu->classlist;
                            }
                        @endphp
                        @if (
                          ($allowedMenu && in_array($menu->slug, $allowedMenu)) ||
                          (!$allowedMenu && $guardedMenu && !in_array($menu->slug, $guardedMenu)) ||
                          ($guardedMenu && !in_array($menu->slug, $guardedMenu)) ||
                          (in_array('*', $allowedMenu) && in_array('*', $guardedMenu)) ||
                          count(array_intersect([$menu->slug], $allowedSidebar)) ||
                          count(array_intersect(['office_v2.sidebar.' . $menu->slug], $userResources)) ||
                          (count(array_intersect(['*'], $allowedSidebar)) && count(array_intersect([$menu->slug], $availableSidebar)))
                        )
                            <li
                                class="nav-item {{ Route::currentRouteName() === $menu->slug ? 'active' : '' }} {{ $menu->slug === "pemetaan-jurusan" && env('SHOW_OFFICE_PEMETAAN_JURUSAN_MENU') !== true ? "d-none" : "" }} {{ $custom_classes }}">
                                <a href="{{ isset($menu->url) ? url($menu->url) : 'javascript:void(0)' }}"
                                    class="d-flex align-items-center"
                                    target="{{ isset($menu->newTab) ? '_blank' : '_self' }}">
                                    <i data-feather="{{ $menu->icon }}"></i>
                                    <span class="menu-title text-truncate">{{ $menu->name }}</span>
                                    @if (isset($menu->badge))
                                        <?php $badgeClasses = 'badge badge-pill badge-light-primary ml-auto mr-1'; ?>
                                        <span
                                            class="{{ isset($menu->badgeClass) ? $menu->badgeClass : $badgeClasses }} ">{{ $menu->badge }}</span>
                                    @endif
                                </a>
                                @if (isset($menu->submenu))
                                    @include('panels/submenu', ['menu' => $menu->submenu])
                                @endif
                            </li>
                        @endif
                    @endif
                @endforeach
            @endif
            {{-- Foreach menu item ends --}}
        </ul>
    </div>
</div>
<!-- END: Main Menu-->
