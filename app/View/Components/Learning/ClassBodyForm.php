<?php

namespace App\View\Components\Learning;

use Illuminate\View\Component;

class ClassBodyForm extends Component
{
  public $type;
  public $utype;
  public $data;
  public $branches;
  public $products;

  public function __construct($type, $utype, $data = null, $branches = [], $products = [])
  {
    $this->type = $type;
    $this->utype = $utype;
    $this->data = $data;
    $this->branches = $branches;
    $this->products = $products;
  }

  /**
   * Get the view / contents that represent the component.
   *
   * @return \Illuminate\Contracts\View\View|\Closure|string
   */
  public function render()
  {
    $data = $this->data;
    $branches = $this->branches;
    $products = $this->products;
    $utype = $this->utype;
    return view('components.learning.class-body-form', compact('data', 'branches', 'products', 'utype'));
  }
}
