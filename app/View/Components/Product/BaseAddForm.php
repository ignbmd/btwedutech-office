<?php

namespace App\View\Components\Product;

use Illuminate\View\Component;

class BaseAddForm extends Component
{
  public $type;

  public function __construct($type)
  {
      $this->type = $type;
  }

  /**
   * Get the view / contents that represent the component.
   *
   * @return \Illuminate\Contracts\View\View|\Closure|string
   */
  public function render()
  {
      return view('components.product.base-add-form');
  }
}
