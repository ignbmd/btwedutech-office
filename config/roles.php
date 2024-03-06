<?php

// ! Don't make nested module

// * This roles below based on user's position

// * For User Individual role
// Add SSO ACL with format `office_v2.[module_name].[action]`
// example
// - office_v2.learning_classroom.create -> for create only
// - office_v2.learning_classroom.* -> for enable all permission


return [
  'sidebar' => [
    'available' => [
      '*', 'home', 'pembelajaran-nav', 'pembelajaran',
      'siswa', 'material', 'performa', 'keuangan-nav',
      'penjualan', 'tagihan', 'branch-bill', 'central-operational-item',
      'keuangan', 'kode-diskon'
    ],
    'user' => [
      'kepala_cabang' => [
        'allowed' => ['pembelajaran-nav', 'pembelajaran', 'siswa', 'material', 'performa', 'keuangan'],
      ],
      'admin_cabang' => [
        'allowed' => ['pembelajaran-nav', 'pembelajaran', 'siswa', 'material', 'performa'],
      ],
      'admin_p3k_online' => [
        'allowed' => ['pembelajaran-nav', 'pembelajaran', 'siswa', 'material', 'performa'],
      ],
      'admin_tatap_muka_online' => [
        'allowed' => ['pembelajaran-nav', 'pembelajaran', 'siswa', 'material', 'performa'],
      ],
    ]
  ],
  'learning_classroom' => [
    'available' => ['*', 'create', 'read', 'edit', 'delete', 'read_schedule', 'read_student', 'assign-received-module', 'show_class_member_action_button', 'share_classroom', 'add_class_members_to_classroom', 'show_all_classroom', 'show_class_member_action_button'],
    'user' => [
      'admin' => [
        'allowed' => ['create', 'read', 'edit', 'delete', 'read_schedule', 'read_student', 'assign-received-module', 'share_classroom', 'add_class_members_to_classroom', 'show_class_member_action_button'],
      ],
      'kepala_cabang' => [
        'allowed' => ['create', 'read', 'edit', 'delete', 'read_schedule', 'read_student'],
      ],
      'admin_cabang' => [
        'allowed' => ['create', 'read', 'edit', 'delete', 'read_schedule', 'read_student'],
      ],
      'mentor' => [
        'allowed' => ['read', 'read_schedule', 'read_student'],
      ]
    ]
  ],
  'learning_schedule' => [
    'available' => ['*', 'create', 'read', 'edit', 'delete', 'read_report', 'read_presence', 'filter_mentor'],
    'user' => [
      'admin' => [
        'allowed' => ['create', 'read', 'edit', 'delete', 'read_report', 'read_presence', 'filter_mentor'],
      ],
      'kepala_cabang' => [
        'allowed' => ['create', 'read', 'edit', 'delete', 'read_report', 'read_presence', 'filter_mentor'],
      ],
      'admin_cabang' => [
        'allowed' => ['create', 'read', 'edit', 'delete', 'read_report', 'read_presence', 'filter_mentor'],
      ],
      'mentor' => [
        'allowed' => ['read', 'read_report', 'read_presence'],
      ]
    ]
  ],
  'learning_report' => [
    'available' => ['*', 'create', 'read', 'edit',],
    'user' => [
      'admin' => [
        'allowed' => ['read'],
      ],
      'kepala_cabang' => [
        'allowed' => ['read'],
      ],
      'admin_cabang' => [
        'allowed' => ['read'],
      ],
      'mentor' => [
        'allowed' => ['create', 'read', 'edit',],
      ]
    ]
  ],
  'learning_presence' => [
    'available' => ['*', 'create', 'read'],
    'user' => [
      'admin' => [
        'allowed' => ['create', 'read', 'edit'],
      ],
      'kepala_cabang' => [
        'allowed' => ['read'],
      ],
      'admin_cabang' => [
        'allowed' => ['read'],
      ],
      'mentor' => [
        'allowed' => ['create', 'read', 'edit'],
      ]
    ]
  ],
  'learning_bkn_score' => [
    'available' => ['*', 'show_action_button'],
    'user' => [
      'admin' => [
        'allowed' => ['show_action_button']
      ],
      'admin_cabang' => [
        'allowed' => ['show_action_button']
      ]
    ]
  ],
  'learning_bkn_score' => [
    'available' => ['*', 'show_action_button'],
    'user' => [
      'admin' => [
        'allowed' => ['show_action_button']
      ],
      'admin_cabang' => [
        'allowed' => ['show_action_button']
      ]
    ]
  ],
  'learning_classmember' => [
    'available' => ['*', 'show_action_button', "show_member_detail", "edit_member", "remove_member", "edit_member_zoom_email"],
    'user' => [
      'admin' => [
        'allowed' => ["*"]
      ],
      'admin_cabang' => [
        'allowed' => ["show_action_button", "show_member_detail"]
      ],
      'kepala_cabang' => [
        'allowed' => ['show_action_button', "show_member_detail"]
      ]
    ]
  ],
  'samapta_tryout_score' => [
    'available' => ['*', 'show_action_button'],
    'user' => [
      'admin' => [
        'allowed' => ['show_action_button']
      ],
      'admin_cabang' => [
        'allowed' => ['show_action_button']
      ]
    ]
  ],
  "material" => [
    'available' => ['*', 'read', 'create', 'edit', 'delete', 'detail'],
    'user' => [
      'admin' => [
        'allowed' => ['read', 'create', 'edit', 'delete', 'detail'],
      ],
      'kepala_cabang' => [
        'allowed' => ['read', 'create', 'edit', 'delete', 'detail'],
      ],
      'admin_cabang' => [
        'allowed' => ['read', 'create', 'edit', 'delete', 'detail'],
      ],
      'mentor' => [
        'allowed' => ['read', 'create', 'edit', 'delete', 'detail'],
      ]
    ]
  ],
  "sale" => [
    'available' => ['*', 'select_product', 'show_index_siplah_sale_page', 'show_index_assessment_sale_page'],
    'user' => [
      'admin' => [
        'allowed' => ['select_product', 'show_index_siplah_sale_page'],
      ],
      'admin_p3k_online' => [
        'allowed' => ['select_product'],
      ],
    ]
  ],
  "bill" => [
    'available' => ['*', 'read', 'edit', 'detail', 'show_all_bill', 'edit_bill_status', 'edit_bill_note'],
    'user' => [
      'admin' => [
        'allowed' => ['read', 'edit', 'detail', 'edit_bill_status', 'edit_bill_note'],
      ],
      'kepala_cabang' => [
        'allowed' => ['read', 'edit', 'detail', 'edit_bill_status', 'edit_bill_note'],
      ],
      'admin_cabang' => [
        'allowed' => ['read', 'edit', 'detail', 'edit_bill_status', 'edit_bill_note'],
      ],
      'keuangan' => [
        'allowed' => ['read', 'edit', 'detail'],
      ]
    ]
  ],
  'bill_detail' => [
    'available' => ['*', 'edit_transaction', 'download_receipt', 'print_receipt'],
    'user' => [
      'admin' => [
        'allowed' => ['edit_transaction', 'download_receipt', 'print_receipt'],
      ],
      'kepala_cabang' => [
        'allowed' => ['edit_transaction', 'download_receipt', 'print_receipt'],
      ],
      'admin_cabang' => [
        'allowed' => ['edit_transaction', 'download_receipt', 'print_receipt'],
      ],
    ]
  ],
  'medical_checkup' => [
    'available' => ['*', 'comment', 'read_history_per_student'],
    'user' => [
      'dokter' => [
        'allowed' => ['comment', 'read_history_per_student']
      ],
      'admin_cabang' => [
        'allowed' => ['read_history_per_student']
      ]
    ]
  ],
  'student' => [
    'available' => ['*', 'add_student_to_class'],
    'user' => [
      'admin' => [
        'allowed' => ['*', 'add_student_to_class']
      ]
    ]
  ],
  'utility' => [
    'available' => ['*' . 'rabbitmq.publish_message'],
    'user' => [
      'admin' => [
        'allowed' => ['*', 'rabbitmq.publish_message']
      ]
    ]
  ],
  'discount_code' => [
    'available' => ['*', 'create', 'edit', 'delete', 'show', 'show_usage'],
    'user' => [
      'admin' => [
        'allowed' => ['create', 'edit', 'show', 'delete', 'show_usage']
      ],
      'keuangan' => [
        'allowed' => ['show', 'show_usage']
      ]
    ]
  ],
  'ebook_code' => [
    'available' => ['*', 'show', 'generate', 'show_history_redeem'],
    'user' => [
      'admin' => [
        'allowed' => ['show', 'generate', 'show_history_redeem']
      ]
    ]
  ],
  'interest_and_talent' => [
    'available' => ['*', 'assign_access_code'],
    'user' => [
      'admin' => [
        'allowed' => ['assign_access_code']
      ]
    ]
  ],
  'interview_score' => [
    'available' => ['*', 'create_session', 'edit_session', 'delete_session'],
    'user' => []
  ],
  'multistages_question' => [
    'available' => ['*', 'show_select_ptk_option', 'show_select_ptn_option'],
    'user' => []
  ]
];
