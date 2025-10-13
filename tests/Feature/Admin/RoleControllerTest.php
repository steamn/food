<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create roles first
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'customer', 'guard_name' => 'web']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
});

it('can view roles index page', function () {
    $response = $this->get(route('admin.roles.index'));

    $response->assertStatus(200);
    $response->assertInertia(
        fn($page) => $page
            ->component('Admin/Roles/Index')
            ->has('roles')
            ->has('filters')
    );
});

it('can view create role page', function () {
    $response = $this->get(route('admin.roles.create'));

    $response->assertStatus(200);
    $response->assertInertia(
        fn($page) => $page
            ->component('Admin/Roles/Create')
            ->has('permissions')
    );
});

it('can create a new role', function () {
    $permission = Permission::create(['name' => 'test permission', 'guard_name' => 'web']);

    $roleData = [
        'name' => 'test-role',
        'permissions' => [$permission->name],
    ];

    $response = $this->post(route('admin.roles.store'), $roleData);

    $response->assertRedirect(route('admin.roles.index'));
    $response->assertSessionHas('success', 'Роль успешно создана.');

    $this->assertDatabaseHas('roles', [
        'name' => 'test-role',
        'guard_name' => 'web',
    ]);

    $role = Role::where('name', 'test-role')->first();
    expect($role->permissions)->toHaveCount(1);
    expect($role->permissions->first()->name)->toBe('test permission');
});

it('can view role show page', function () {
    $role = Role::create(['name' => 'test-role', 'guard_name' => 'web']);

    $response = $this->get(route('admin.roles.show', $role));

    $response->assertStatus(200);
    $response->assertInertia(
        fn($page) => $page
            ->component('Admin/Roles/Show')
            ->has('role')
    );
});

it('can view edit role page', function () {
    $role = Role::create(['name' => 'test-role', 'guard_name' => 'web']);

    $response = $this->get(route('admin.roles.edit', $role));

    $response->assertStatus(200);
    $response->assertInertia(
        fn($page) => $page
            ->component('Admin/Roles/Edit')
            ->has('role')
            ->has('permissions')
    );
});

it('can update a role', function () {
    $role = Role::create(['name' => 'test-role', 'guard_name' => 'web']);
    $permission = Permission::create(['name' => 'test permission', 'guard_name' => 'web']);

    $updateData = [
        'name' => 'updated-role',
        'permissions' => [$permission->name],
    ];

    $response = $this->put(route('admin.roles.update', $role), $updateData);

    $response->assertRedirect(route('admin.roles.index'));
    $response->assertSessionHas('success', 'Роль успешно обновлена.');

    $this->assertDatabaseHas('roles', [
        'id' => $role->id,
        'name' => 'updated-role',
    ]);

    $role->refresh();
    expect($role->permissions)->toHaveCount(1);
    expect($role->permissions->first()->name)->toBe('test permission');
});

it('can delete a role', function () {
    $role = Role::create(['name' => 'test-role', 'guard_name' => 'web']);

    $response = $this->delete(route('admin.roles.destroy', $role));

    $response->assertRedirect(route('admin.roles.index'));
    $response->assertSessionHas('success', 'Роль успешно удалена.');

    $this->assertDatabaseMissing('roles', [
        'id' => $role->id,
    ]);
});

it('cannot delete super-admin role', function () {
    $role = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

    $response = $this->delete(route('admin.roles.destroy', $role));

    $response->assertRedirect();
    $response->assertSessionHas('error', 'Нельзя удалить роль super-admin.');

    $this->assertDatabaseHas('roles', [
        'id' => $role->id,
    ]);
});

it('validates role name is required', function () {
    $response = $this->post(route('admin.roles.store'), []);

    $response->assertSessionHasErrors(['name']);
});

it('validates role name is unique', function () {
    Role::create(['name' => 'existing-role', 'guard_name' => 'web']);

    $response = $this->post(route('admin.roles.store'), [
        'name' => 'existing-role',
    ]);

    $response->assertSessionHasErrors(['name']);
});

it('validates permissions exist', function () {
    $response = $this->post(route('admin.roles.store'), [
        'name' => 'test-role',
        'permissions' => ['non-existent-permission'],
    ]);

    $response->assertSessionHasErrors(['permissions.0']);
});

it('requires authentication to access roles', function () {
    auth()->logout();

    $this->get(route('admin.roles.index'))->assertRedirect('/login');
    $this->get(route('admin.roles.create'))->assertRedirect('/login');
    $this->post(route('admin.roles.store'), [])->assertRedirect('/login');
});

it('requires admin role to access roles', function () {
    $user = User::factory()->create();
    $user->assignRole('customer');
    $this->actingAs($user);

    $this->get(route('admin.roles.index'))->assertForbidden();
    $this->get(route('admin.roles.create'))->assertForbidden();
    $this->post(route('admin.roles.store'), [])->assertForbidden();
});