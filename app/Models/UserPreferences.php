<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPreferences extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'language',
        'timezone',
        'currency',
        'theme',
        'compact_mode',
        'dashboard_widgets',
        'notification_settings',
        'quiet_hours_start',
        'quiet_hours_end',
        'default_delivery_time',
        'auto_confirm_orders',
        'max_order_amount',
        'show_phone',
        'show_email',
        'allow_marketing',
    ];

    protected function casts(): array
    {
        return [
            'dashboard_widgets' => 'array',
            'notification_settings' => 'array',
            'quiet_hours_start' => 'datetime:H:i',
            'quiet_hours_end' => 'datetime:H:i',
            'compact_mode' => 'boolean',
            'auto_confirm_orders' => 'boolean',
            'show_phone' => 'boolean',
            'show_email' => 'boolean',
            'allow_marketing' => 'boolean',
            'max_order_amount' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
