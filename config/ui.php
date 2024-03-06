<?php

return [
  'learning' => [
    'classroom' => [
      'status' => [
        'ALL' => [
          'text' => '',
          'icon' => 'grid',
          'count' => 0,
          'color' => 'primary',
        ],
        'ONGOING' => [
          'text' => 'Sedang Berlangsung',
          'icon' => 'activity',
          'count' => 0,
          'color' => 'primary',
        ],
        'ENDED' => [
          'text' => 'Selesai',
          'icon' => 'check',
          'count' => 0,
          'color' => 'success',
        ],
        'NOT_ACTIVE' => [
          'text' => 'Tidak Aktif',
          'icon' => 'x',
          'count' => 0,
          'color' => 'warning',
        ]
      ]
    ]
  ],
  'file_color' => [
    'doc' => 'primary',
    'docx' => 'primary',
    'pdf' => 'success',
  ],
  'billing' => [
    'payment_method' => [
      'MANUAL_TF_BCA' => 'Transfer Manual BCA',
      'MANUAL_TF_BNI' => 'Transfer Manual BNI',
      'MANUAL_TF_BRI' => 'Transfer Manual BRI',
      'CASH' => 'Cash',
      'MIDTRANS' => 'Midtrans'
    ]
  ]
];
