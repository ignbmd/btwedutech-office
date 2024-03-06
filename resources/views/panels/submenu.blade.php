{{-- For submenu --}}
<ul class="menu-content">
  @if(isset($menu))

    @foreach($menu as $submenu)

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
      @if(
        ($allowedMenu && in_array($submenu->slug, $allowedMenu)) ||
        (!$allowedMenu && $guardedMenu && !in_array($submenu->slug, $guardedMenu)) ||
        ($guardedMenu && !in_array($submenu->slug, $guardedMenu)) ||
        (in_array('*', $allowedMenu) && in_array('*', $guardedMenu)) ||
        count(array_intersect([$submenu->slug], $allowedSidebar)) ||
        count(array_intersect(['office_v2.sidebar.' . $submenu->slug], $userResources)) ||
        (count(array_intersect(['*'], $allowedSidebar)) && count(array_intersect([$submenu->slug], $availableSidebar)))
      )
        <li class="{{ $submenu->slug === Route::currentRouteName() ? 'active' : '' }}">
          <a href="{{isset($submenu->url) ? url($submenu->url):'javascript:void(0)'}}" class="d-flex align-items-center" target="{{isset($submenu->newTab) && $submenu->newTab === true  ? '_blank':'_self'}}">
            @if(isset($submenu->icon)) <i data-feather="{{$submenu->icon}}"></i> @endif
            <span class="menu-item">{{ $submenu->name }}</span>
          </a>
          @if (isset($submenu->submenu))
            @include('panels/submenu', ['menu' => $submenu->submenu])
          @endif
        </li>
      @endif
    @endforeach

  @endif
</ul>
