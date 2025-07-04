import { test, expect } from '@playwright/test';

test.describe('NovelChatAppModule', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display initial UI elements', async ({ page }) => {
    // Header verification
    await expect(page.getByTestId('app-title')).toHaveText('Novel Chat');
    await expect(page.getByTestId('app-subtitle')).toHaveText('เรื่องหลอน ๆ ของ Dev นอนน้อย');

    // Initial messages
    await expect(page.getByTestId('system-message')).toContainText('เรื่องราวของเรากำลังจะเริ่มต้น...');

    // Input area
    await expect(page.getByTestId('message-input')).toBeVisible();
    await expect(page.getByTestId('send-button')).toBeVisible();
  });

  test('should send and display user messages', async ({ page }) => {
    // Send message as first character
    await page.getByTestId('message-input').fill('สวัสดีครับ');
    await page.getByTestId('send-button').click();

    // Verify message appears
    await expect(page.locator('text=สวัสดีครับ').last()).toBeVisible();

    // Verify sender name in message header
    const lastMessageHeader = page.locator('[data-testid="message-header"]').last();
    await expect(lastMessageHeader).toContainText('มอส');

    // Verify message bubble styling
    const lastMessageBubble = page.locator('[data-testid^="message-bubble-"]').last();
    await expect(lastMessageBubble).toHaveClass(/bg-gradient-to-br/);
    await expect(lastMessageBubble).toHaveClass(/from-blue-400/);
  });

  test('should switch between characters', async ({ page }) => {
    // Verify initial character
    await expect(page.getByTestId('current-character-name')).toHaveText('มอส');

    // Switch to second character
    await page.getByTestId('next-character-button').click();
    await expect(page.getByTestId('current-character-name')).toHaveText('มายา');

    // Send message as second character
    await page.getByTestId('message-input').fill('สวัสดีค่ะ');
    await page.getByTestId('send-button').click();

    // Verify message appears
    await expect(page.locator('text=สวัสดีค่ะ').last()).toBeVisible();
    await expect(page.getByTestId('current-character-name')).toHaveText('มายา');
  });

  test('should add new character', async ({ page }) => {
    // Open settings
    await page.getByTestId('settings-button').click();
    await expect(page.getByTestId('settings-modal')).toBeVisible();

    // Open add character modal
    await page.getByTestId('add-character-button').click();
    await expect(page.getByTestId('character-modal')).toBeVisible();

    // Fill character details
    await page.getByTestId('character-id-input').fill('new-char');
    await page.getByTestId('character-name-input').fill('ตัวละครทดสอบ');
    await page.getByTestId('character-avatar-input').fill('🤖');
    await page.getByTestId('color-option-ม่วง').click();
    await page.getByTestId('character-personality-input').fill('ตัวละครสำหรับทดสอบระบบ');

    // Submit
    await page.getByTestId('save-character-button').click();

    // Verify new character appears
    await expect(page.getByTestId('character-card-new-char')).toBeVisible();

    // Close settings
    await page.getByTestId('close-settings-button').click();

    // Switch to new character (skip system character)
    await page.getByTestId('next-character-button').click(); // Move to Maya
    await page.getByTestId('next-character-button').click(); // Move to System
    await page.getByTestId('next-character-button').click(); // Move to New Character
    await expect(page.getByTestId('current-character-name')).toHaveText('ตัวละครทดสอบ');

    // Send message as new character
    await page.getByTestId('message-input').fill('ข้อความทดสอบ');
    await page.getByTestId('send-button').click();

    // Verify message styling - use more specific selector
    const newMessageBubble = page.locator('[data-testid^="message-bubble-"]:has-text("ข้อความทดสอบ")');
    await expect(newMessageBubble).toHaveClass(/from-purple-400/);
  });

  test('should edit character', async ({ page }) => {
    // Open settings
    await page.getByTestId('settings-button').click();

    // Open edit modal for Maya
    await page.getByTestId('character-card-2').hover();
    await page.getByTestId('edit-character-2').click();

    // Edit details
    await page.getByTestId('character-name-input').fill('มายา (แก้ไขแล้ว)');
    await page.getByTestId('color-option-ส้ม').click();
    await page.getByTestId('character-personality-input').fill('บุคลิกใหม่หลังแก้ไข');

    // Save changes
    await page.getByTestId('save-character-button').click();

    // Verify changes
    await expect(page.getByTestId('character-name-2')).toHaveText('มายา (แก้ไขแล้ว)');

    // Close settings
    await page.getByTestId('close-settings-button').click();

    // Switch to Maya (skip system character)
    await page.getByTestId('next-character-button').click(); // Move to Maya
    await expect(page.getByTestId('current-character-name')).toHaveText('มายา (แก้ไขแล้ว)');

    // Send message as Maya
    await page.getByTestId('message-input').fill('ข้อความหลังแก้ไข');
    await page.getByTestId('send-button').click();

    // Verify styling changed - use more specific selector
    const editedMessageBubble = page.locator('.rounded-2xl:has-text("ข้อความหลังแก้ไข")');
    await expect(editedMessageBubble).toHaveClass(/from-orange-400/);
  });

  test('should delete character', async ({ page }) => {
    // Add a character to delete (since initial characters are fixed)
    await page.getByTestId('settings-button').click();
    await page.getByTestId('add-character-button').click();
    await page.getByTestId('character-id-input').fill('temp-char');
    await page.getByTestId('character-name-input').fill('ตัวละครชั่วคราว');
    await page.getByTestId('character-avatar-input').fill('👻');
    await page.getByTestId('color-option-เทา').click();
    await page.getByTestId('character-personality-input').fill('ตัวละครที่พร้อมจะถูกลบ');
    await page.getByTestId('save-character-button').click();
    await page.getByTestId('close-settings-button').click();

    // Switch to the temporary character
    await page.getByTestId('next-character-button').click(); // Maya
    await page.getByTestId('next-character-button').click(); // System
    await page.getByTestId('next-character-button').click(); // Temp character
    await expect(page.getByTestId('current-character-name')).toHaveText('ตัวละครชั่วคราว');

    // Open settings again
    await page.getByTestId('settings-button').click();

    // Delete the temporary character
    const tempCard = page.getByTestId('character-card-temp-char');
    await tempCard.hover();
    await page.getByTestId('delete-character-temp-char').click();

    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());

    // Verify deletion
    await expect(page.getByTestId('character-card-temp-char')).not.toBeVisible();

    // Close settings
    await page.getByTestId('close-settings-button').click();

    // Verify we're back to the first character
    await expect(page.getByTestId('current-character-name')).toHaveText('มอส');
  });

  test('should update app settings', async ({ page }) => {
    // Open settings
    await page.getByTestId('settings-button').click();

    // Update app config
    await page.getByTestId('app-title-input').fill('แอปใหม่');
    await page.getByTestId('app-subtitle-input').fill('คำอธิบายใหม่');

    // Toggle sound
    await page.getByTestId('toggle-sound-button').click();

    // Close settings
    await page.getByTestId('close-settings-button').click();

    // Verify changes
    await expect(page.getByTestId('app-title')).toHaveText('แอปใหม่');
    await expect(page.getByTestId('app-subtitle')).toHaveText('คำอธิบายใหม่');
  });

  test('should prevent deleting system character', async ({ page }) => {
    // Open settings
    await page.getByTestId('settings-button').click();

    // Try to delete system character
    const systemCard = page.getByTestId('character-card-system');
    await systemCard.hover();
    await expect(page.getByTestId('delete-character-system')).not.toBeVisible();
  });
});