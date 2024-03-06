@extends('layouts/contentLayoutMaster')

@section('title', 'Detail Produk')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/swiper.min.css')) }}">
@endsection
@section('page-style')
    <link rel="stylesheet" href="{{ asset(mix('css/base/pages/app-ecommerce-details.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-swiper.css')) }}">
@endsection

@section('content')
    <section class="app-ecommerce-details">
        <div class="card">
            <!-- Product Details starts -->
            <div class="card-body">
                <div class="row my-2">
                    <div class="col-12 col-md-5 d-flex align-items-start justify-content-center mb-2 mb-md-0">
                        <div class="swiper-navigations swiper-container" style="background-color: #eaeaea">
                            <div class="swiper-wrapper d-flex align-items-center">
                                @php
                                    $defaultImg = env('BASE_IMG_URL') . '/image/product/default.jpg';
                                @endphp
                                @if ($product->image && count($product->image) > 0)
                                    @foreach ($product->image as $imageUrl)
                                        <div class="swiper-slide d-flex justify-content-center">
                                            <img class="img-fluid product-img" src="{{ $imageUrl }}" alt="banner"
                                                width="400" />
                                        </div>
                                    @endforeach
                                @else
                                    <div class="swiper-slide d-flex justify-content-center">
                                        <img class="img-fluid product-img" src="{{ $defaultImg }}" alt="banner"
                                            width="400" />
                                    </div>
                                @endif
                            </div>
                            <!-- Add Arrows -->
                            <div class="swiper-button-next"></div>
                            <div class="swiper-button-prev"></div>
                        </div>
                    </div>
                    <div class="col-12 col-md-7">
                        <h4>{{ $product->title }}</h4>
                        <div class="card-text item-company">
                            <span class="company-name text-primary">{{ $product->program }} -
                                <div class="badge badge-success">{{ $product->product_code }}</div>
                                <div class="badge badge-primary">
                                    @if (!$product->included_product || count($product->included_product) === 0)
                                        Satuan
                                    @else
                                        Paket
                                    @endif
                                </div>
                            </span>
                        </div>
                        <div class="ecommerce-details-price d-flex flex-wrap mt-1">
                            <ul class="product-features list-unstyled">
                                <li>
                                    <i data-feather="dollar-sign"></i>
                                    <span>Harga Dasar : Rp
                                        {{ number_format($product->base_price, 0, ',', '.') }}
                                    </span>
                                </li>
                                <li>
                                    <i data-feather="shopping-cart"></i>
                                    <span>Harga Jual : Rp
                                        {{ number_format($product->sell_price, 0, ',', '.') }}
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <p class="card-text">
                            {!! $product->description !!}
                        </p>
                        <small>
                            @if ($product->type == 'ONLINE_PRODUCT')
                                Product Online
                            @elseif($product->type == 'ONLINE_PRODUCT_IOS')
                                Product Online IOS
                            @elseif($product->type == 'ONLINE_PRODUCT_ANDROID')
                                Product Online Android
                            @elseif($product->type == 'OFFLINE_PRODUCT')
                                Product Offline
                            @endif
                            dari cabang <b>{{ $product->branch_code }}</b>
                        </small>
                        @if ($product->included_product && count($product->included_product) > 0)
                            <hr>
                            <h6>Included Product</h6>
                            <div class="card-transaction">
                                @foreach ($product->included_product as $item)
                                    <div class="transaction-item mt-2">
                                        <div class="media">
                                            <div class="avatar bg-light-success rounded">
                                                <div class="avatar-content">
                                                    <i data-feather='triangle' class="avatar-icon font-medium-3"></i>
                                                </div>
                                            </div>
                                            <div class="media-body">
                                                <h6 class="transaction-title">{{ $item->title }}</h6>
                                                <small>{{ $item->product_code }}</small>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @endif

                        <div class="d-flex flex-column flex-sm-row pt-4">
                            <a href="/produk/edit/{{ $product->_id }}" class="btn btn-primary mr-0 mr-sm-1 mb-1 mb-sm-0">
                                <i data-feather="edit" class="mr-50"></i>
                                <span class="add-to-cart">Ubah</span>
                            </a>
                        </div>
                    </div>
                </div>
                <!-- Product Details ends -->
            </div>
    </section>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/extensions/swiper.min.js')) }}"></script>
@endsection
@section('page-script')
    <script src="{{ asset(mix('js/scripts/pages/product/detail.js')) }}"></script>
    {{-- <script src="{{ asset(mix('js/scripts/extensions/ext-component-swiper.js')) }}"></script> --}}
@endsection
