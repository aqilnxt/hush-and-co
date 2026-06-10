<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'points',
        'provider',
        'provider_id',
        'avatar',
        'google_id',
        'birth_date',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    protected $appends = [
        'completed_transactions_count',
        'progress_count',
        'remaining_transactions',
        'free_drinks_available',
        'is_birthday_month',
        'birthday_drink_claimed_year',
        'first_order_bonus_claimed',
    ];

    // Relasi: user punya banyak order
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Relasi: user punya banyak point log
    public function pointLogs()
    {
        return $this->hasMany(PointLog::class);
    }

    // Helper: cek role
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    // Accessors for Loyalty features
    public function getCompletedTransactionsCountAttribute(): int
    {
        return $this->orders()
            ->where('status', 'selesai')
            ->where('payment_status', 'paid')
            ->count();
    }

    public function getProgressCountAttribute(): int
    {
        return $this->getCompletedTransactionsCountAttribute() % 10;
    }

    public function getRemainingTransactionsAttribute(): int
    {
        return 10 - $this->getProgressCountAttribute();
    }

    public function getFreeDrinksAvailableAttribute(): int
    {
        $completed = $this->getCompletedTransactionsCountAttribute();
        $claimed = $this->orders()
            ->where('free_drink_claimed', true)
            ->where('status', '!=', 'dibatalkan')
            ->count();
        return max(0, (int) floor($completed / 10) - $claimed);
    }

    public function getIsBirthdayMonthAttribute(): bool
    {
        if (!$this->birth_date) {
            return false;
        }
        return (int) date('m', strtotime($this->birth_date)) === (int) date('m');
    }

    public function getBirthdayDrinkClaimedYearAttribute(): bool
    {
        return $this->orders()
            ->where('birthday_drink_claimed', true)
            ->whereYear('created_at', date('Y'))
            ->where('status', '!=', 'dibatalkan')
            ->exists();
    }

    public function getFirstOrderBonusClaimedAttribute(): bool
    {
        // Check if user has already claimed first order bonus
        return $this->pointLogs()
            ->where('type', 'first_order_bonus')
            ->exists();
    }
}
