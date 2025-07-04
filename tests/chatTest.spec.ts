import { test, expect } from '@playwright/test';

test.describe('NovelChatApp', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display initial UI elements', async ({ page }) => {
    // Header verification
    await expect(page.locator('text=Novel Chat')).toBeVisible();
    await expect(page.locator('text=เรื่องหลอน ๆ ของ Dev นอนน้อย')).toBeVisible();

    // Initial messages
    await expect(page.locator('text=📖 เรื่องราวของเรากำลังจะเริ่มต้น...')).toBeVisible();

    // Input area
    await expect(page.getByPlaceholder('พิมพ์ข้อความในนามของ มอส...')).toBeVisible();
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });

  test('should send and display user messages', async ({ page }) => {
    // Send message as first character
    await page.fill('input[placeholder*="พิมพ์ข้อความ"]', 'สวัสดีครับ');
    await page.click('button:has-text("Send")');

    // Verify message appears
    await expect(page.locator('text=สวัสดีครับ').last()).toBeVisible();
    await expect(page.locator('text=มอส').last()).toBeVisible();

    // Verify message bubble styling
    const lastMessageBubble = page.locator('.rounded-2xl').last();
    await expect(lastMessageBubble).toHaveClass(/bg-gradient-to-br/);
    await expect(lastMessageBubble).toHaveClass(/from-blue-400/);
  });

  test('should switch between characters', async ({ page }) => {
    // Verify initial character
    await expect(page.locator('text=มอส').last()).toBeVisible();

    // Switch to second character
    await page.click('button:has(> svg[data-icon="chevron-right"])');
    await expect(page.locator('text=มายา')).toBeVisible();

    // Send message as second character
    await page.fill('input[placeholder*="พิมพ์ข้อความ"]', 'สวัสดีค่ะ');
    await page.click('button:has-text("Send")');

    // Verify message appears
    await expect(page.locator('text=สวัสดีค่ะ').last()).toBeVisible();
    await expect(page.locator('text=มายา').last()).toBeVisible();
  });

  test('should add new character', async ({ page }) => {
    // Open settings
    await page.click('button:has(> svg[data-icon="settings"])');
    await expect(page.locator('text=ตั้งค่า')).toBeVisible();

    // Open add character modal
    await page.click('text=เพิ่มตัวละครใหม่');
    await expect(page.locator('text=เพิ่มตัวละครใหม่')).toBeVisible();

    // Fill character details
    await page.fill('#characterId', 'new-char');
    await page.fill('#characterName', 'ตัวละครทดสอบ');
    await page.fill('#characterAvatar', '🤖');
    await page.click('text=ม่วง');
    await page.fill('#characterPersonality', 'ตัวละครสำหรับทดสอบระบบ');

    // Submit
    await page.click('text=เพิ่มตัวละคร');

    // Verify new character appears
    await expect(page.locator('text=ตัวละครทดสอบ')).toBeVisible();

    // Switch to new character
    await page.click('button:has(> svg[data-icon="chevron-right"])');
    await page.click('button:has(> svg[data-icon="chevron-right"])');
    await expect(page.locator('text=ตัวละครทดสอบ')).toBeVisible();

    // Send message as new character
    await page.fill('input[placeholder*="พิมพ์ข้อความ"]', 'ข้อความทดสอบ');
    await page.click('button:has-text("Send")');

    // Verify message styling
    const lastMessageBubble = page.locator('.rounded-2xl').last();
    await expect(lastMessageBubble).toHaveClass(/from-purple-400/);
  });

  test('should edit character', async ({ page }) => {
    // Open settings
    await page.click('button:has(> svg[data-icon="settings"])');

    // Open edit modal for Maya
    await page.locator('text=มายา').first().hover();
    await page.locator('button:has(> svg[data-icon="edit"])').first().click();

    // Edit details
    await page.fill('#characterName', 'มายา (แก้ไขแล้ว)');
    await page.click('text=ส้ม');
    await page.fill('#characterPersonality', 'บุคลิกใหม่หลังแก้ไข');

    // Save changes
    await page.click('text=บันทึกการแก้ไข');

    // Verify changes
    await expect(page.locator('text=มายา (แก้ไขแล้ว)')).toBeVisible();

    // Switch to Maya and send message
    await page.click('button:has(> svg[data-icon="chevron-right"])');
    await page.fill('input[placeholder*="พิมพ์ข้อความ"]', 'ข้อความหลังแก้ไข');
    await page.click('button:has-text("Send")');

    // Verify styling changed
    const lastMessageBubble = page.locator('.rounded-2xl').last();
    await expect(lastMessageBubble).toHaveClass(/from-orange-400/);
  });

  test('should delete character', async ({ page }) => {
    // Open settings
    await page.click('button:has(> svg[data-icon="settings"])');

    // Delete Maya
    const mayaCard = page.locator('div:has-text("มายา")').first();
    await mayaCard.hover();
    await mayaCard.locator('button:has(> svg[data-icon="trash-2"])').click();

    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());

    // Verify deletion
    await expect(page.locator('text=มายา')).not.toBeVisible();

    // Verify character switching
    await expect(page.locator('text=มอส')).toBeVisible();
    await page.click('button:has(> svg[data-icon="chevron-right"])');
    await expect(page.locator('text=ตัวละครทดสอบ')).toBeVisible();
  });

  test('should update app settings', async ({ page }) => {
    // Open settings
    await page.click('button:has(> svg[data-icon="settings"])');

    // Update app config
    await page.fill('#appTitle', 'แอพใหม่');
    await page.fill('#appSubtitle', 'คำอธิบายใหม่');

    // Toggle sound
    await page.click('text=เปิด/ปิดเสียง');

    // Close settings
    await page.click('button:has(> svg[data-icon="x"])');

    // Verify changes
    await expect(page.locator('text=แอพใหม่')).toBeVisible();
    await expect(page.locator('text=คำอธิบายใหม่')).toBeVisible();
  });

  test('should prevent deleting system character', async ({ page }) => {
    // Open settings
    await page.click('button:has(> svg[data-icon="settings"])');

    // Try to delete system character
    const systemCard = page.locator('div:has-text("ผู้เล่าเรื่อง")');
    await systemCard.hover();
    await expect(systemCard.locator('button:has(> svg[data-icon="trash-2"])')).not.toBeVisible();
  });
});