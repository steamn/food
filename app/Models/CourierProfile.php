<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'middle_name',
        'phone',
        'email',
        'passport_series',
        'passport_number',
        'passport_issued_date',
        'passport_issued_by',
        'transport_type',
        'transport_model',
        'transport_number',
        'transport_color',
        'status',
        'rating',
        'total_deliveries',
        'total_earnings',
        'delivery_zones',
        'work_schedule',
        'bank_name',
        'bank_account',
        'bank_card_number',
        'notes',
        'documents',
    ];

    protected function casts(): array
    {
        return [
            'delivery_zones' => 'array',
            'work_schedule' => 'array',
            'documents' => 'array',
            'rating' => 'decimal:2',
            'total_earnings' => 'decimal:2',
            'passport_issued_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'courier_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function getFullNameAttribute()
    {
        return trim($this->first_name.' '.$this->last_name);
    }
}
