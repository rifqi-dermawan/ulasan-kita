<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'is_edited_by_user' => 'boolean',
    ];

    protected $appends = [
        'photo_url',
    ];

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? asset('storage/'.$this->photo_path) : null;
    }

    public const ALLOWED_SOURCES = [
        'qr',
        'google_maps',
        'whatsapp',
        'instagram',
        'lisan',
        'lainnya',
    ];

    public const SOURCE_LABELS = [
        'qr' => 'QR Code',
        'google_maps' => 'Google Maps',
        'whatsapp' => 'WhatsApp',
        'instagram' => 'Instagram',
        'lisan' => 'Ulasan Lisan',
        'lainnya' => 'Lainnya',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
