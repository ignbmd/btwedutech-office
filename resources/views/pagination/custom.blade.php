@if($paginator->hasPages())
    <nav aria-label="Page navigation">
        <ul class="pagination pagination-info justify-content-end mt-2">
            @if($paginator->onFirstPage())
            <li class="page-item prev disabled">
                <a class="page-link" href="javascript:void(0);" aria-label="Previous"></a>
            </li>
            @else
            <li class="page-item prev">
                <a class="page-link" href="{{ $paginator->previousPageUrl() }}" aria-label="Previous"></a>
            </li>
            @endif

            @foreach($elements as $element)
                @if(is_string($element))
                    <li class="page-item disabled"><a class="page-link" href="javascript:void(0);">{{ $element }}</a></li>
                @endif

                @if(is_array($element))
                    @foreach($element as $page => $url)
                        @if($page == $paginator->currentPage())
                            <li class="page-item active"><a class="page-link" href="javascript:void(0);">{{ $page }}</a></li>
                        @else
                            <li class="page-item"><a class="page-link" href="{{ $url }}">{{ $page }}</a></li>
                        @endif
                    @endforeach
                @endif
            @endforeach

            @if($paginator->hasMorePages())
            <li class="page-item next">
                <a class="page-link" href="{{ $paginator->nextPageUrl() }}" aria-label="Next"></a>
            </li>
            @else
            <li class="page-item next disabled">
                <a class="page-link" href="javascript:void(0);" aria-label="Next"></a>
            </li>
            @endif
        </ul>
    </nav>
@endif