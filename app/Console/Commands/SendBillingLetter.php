<?php

namespace App\Console\Commands;

use App\Helpers\BillingLetter;
use App\Services\BranchService\Branch;
use App\Services\FinanceService\Bill;
use App\Services\ProfileService\Profile;
use Illuminate\Console\Command;

class SendBillingLetter extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billing-letter:send {type : Send unpaid invoice based on their due date. Choose between "h-7" for a week before bill due date, "h-2" for two days before bill due date, or "h-0" for on/past bill due date}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Send billing letter to Student's parent WhatsApp number";

    private Bill $billFinanceService;
    private Branch $branchService;
    private Profile $profileService;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(
      Bill $billFinanceService,
      Branch $branchService,
      Profile $profileService
    ) {
        parent::__construct();
        $this->billFinanceService = $billFinanceService;
        $this->branchService = $branchService;
        $this->profileService = $profileService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
      $type = $this->argument('type');
      $billInvoice = new BillingLetter($this->billFinanceService, $this->branchService, $this->profileService);
      switch($type) {
        case "h-7":
          $billInvoice->sendBillingLetterAWeekBeforeDueDate();
        break;
        case "h-0":
          $billInvoice->sendBillingLetterOnAndPastDueDate();
        break;
        default:
          $this->warn('Type arguments not valid. Choose between "h-7" for a week before bill due date, or "h-0" for on/past bill due date');
        break;
      }
    }
}
