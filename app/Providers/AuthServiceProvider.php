<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Helpers\UserRole;
use App\Helpers\Bill;
class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();
        view()->composer('*', function($view) {
            if(request()->path() === "dashboard-uka") return;
            if((UserRole::isBranchAdmin() || UserRole::isBranchHead()) && in_array("BillController@*", Auth::user()->resources)) {
                $unpaid_bills_counts = Bill::getUnpaidBillsCounts(Auth::user()->branch_code, "OFFLINE_PRODUCT");
                $view->with('unpaid_bills_counts', $unpaid_bills_counts);
            }
        });
    }
}
