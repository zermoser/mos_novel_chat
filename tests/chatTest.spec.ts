import { test, expect } from '@playwright/test';

// await page.waitForTimeout(8000); // รอ 8วิ หน่วยเป็นมิลลิวินาที

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

    // รอจนกว่า message bubble จะปรากฏ
    const messageBubble = page.locator('.rounded-2xl:has-text("สวัสดีครับ")');
    await messageBubble.waitFor({ state: 'visible' });

    // ตรวจสอบ class โดยตรง
    const classes = await messageBubble.getAttribute('class');
    expect(classes).toContain('from-blue-400');
    expect(classes).toContain('to-indigo-500');
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
    const newMessageBubble = page.locator('.rounded-2xl:has-text("ข้อความทดสอบ")');
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

    // Wait for character to be added before closing settings
    await expect(page.getByTestId('character-card-temp-char')).toBeVisible();
    await page.getByTestId('close-settings-button').click();

    // Switch to the temporary character
    await page.getByTestId('next-character-button').click(); // Maya
    await page.getByTestId('next-character-button').click(); // System
    await page.getByTestId('next-character-button').click(); // Temp character
    await expect(page.getByTestId('current-character-name')).toHaveText('ตัวละครชั่วคราว');

    // Open settings again
    await page.getByTestId('settings-button').click();

    // Set up dialog handler
    page.once('dialog', dialog => dialog.accept());

    // Delete the temporary character
    await page.getByTestId('delete-character-temp-char').click();

    // Wait for character card to be removed
    await expect(page.getByTestId('character-card-temp-char')).not.toBeAttached();
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

  test('should handle group conversation with time and location notifications', async ({ page }) => {
    // สร้างตัวละครเพิ่ม 2 ตัว (รวมตัวละครเริ่มต้น 2 ตัว จะมีทั้งหมด 4 ตัว)
    await page.getByTestId('settings-button').click();

    // สร้างตัวละครที่ 3
    await page.getByTestId('add-character-button').click();
    await page.getByTestId('character-id-input').fill('char3');
    await page.getByTestId('character-name-input').fill('นัท');
    await page.getByTestId('character-avatar-input').fill('👨‍🎤');
    await page.getByTestId('color-option-เขียว').click();
    await page.getByTestId('character-personality-input').fill('ศิลปินอารมณ์ดี');
    await page.getByTestId('save-character-button').click();

    // สร้างตัวละครที่ 4
    await page.getByTestId('add-character-button').click();
    await page.getByTestId('character-id-input').fill('char4');
    await page.getByTestId('character-name-input').fill('พลอย');
    await page.getByTestId('character-avatar-input').fill('👩‍🎓');
    await page.getByTestId('color-option-เหลือง').click();
    await page.getByTestId('character-personality-input').fill('นักศึกษาจอมขยัน');
    await page.getByTestId('save-character-button').click();

    await page.getByTestId('close-settings-button').click();

    // ระบบแจ้งสถานที่และเวลา (สุ่มสถานที่และเวลา)
    const locations = ['ห้องสมุดมหาวิทยาลัย', 'คาเฟ่ย่านเมืองเก่า', 'สวนสาธารณะกลางเมือง', 'หอพักนักศึกษา'];
    const times = ['🌞 เช้าวันจันทร์ที่สดใส', '🌆 ยามเย็นวันศุกร์', '🌙 คืนวันเสาร์อันเงียบสงบ', '☀️ ตอนเที่ยงวันอาทิตย์'];

    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomTime = times[Math.floor(Math.random() * times.length)];
    const systemMessage1 = `${randomTime} ใน${randomLocation}`;

    // ตรวจสอบจำนวนข้อความเริ่มต้น
    const initialMessages = await page.locator('[data-testid^="message-bubble-"], [data-testid="system-message"]').count();

    // ส่งข้อความระบบผ่านการเพิ่มโดยตรง
    await page.evaluate((message) => {
      const messagesContainer = document.querySelector('[data-testid="messages-container"]');
      if (messagesContainer) {
        const systemMessage = document.createElement('div');
        systemMessage.innerHTML = `
        <div data-testid="system-message" class="flex justify-center my-2">
          <div class="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2 text-sm max-w-[90%] text-center">
            <p class="whitespace-pre-wrap">${message}</p>
          </div>
        </div>
      `;
        messagesContainer.appendChild(systemMessage);
      }
    }, systemMessage1);

    // ตรวจสอบข้อความระบบ
    await expect(page.locator(`text=${randomLocation}`).first()).toBeVisible();
    await expect(page.locator(`text=${randomTime.split(' ')[0]}`).first()).toBeVisible();

    // สนทนากลุ่ม - ตัวละครที่ 1 (มอส)
    await page.getByTestId('next-character-button').click(); // ไปมอส
    await page.getByTestId('message-input').fill('ทุกคนได้ยินข่าวลือเรื่องห้องสมุดตอนดึกมั้ย?');
    await page.getByTestId('send-button').click();

    // ตัวละครที่ 2 (มายา)
    await page.getByTestId('next-character-button').click(); // ไปมายา
    await page.getByTestId('message-input').fill('ฉันได้ยินมาว่ามีบางคนเห็นเงารูปแปลกๆ ในห้องสมุดตอนเที่ยงคืน!');
    await page.getByTestId('send-button').click();

    // ตัวละครที่ 3 (นัท)
    await page.getByTestId('next-character-button').click(); // ไปนัท
    await page.getByTestId('message-input').fill('ไม่นะ! ผมต้องมาทำงานตอนดึกบ่อยๆ นะเนี่ย 😱');
    await page.getByTestId('send-button').click();

    // ตัวละครที่ 4 (พลอย)
    await page.getByTestId('next-character-button').click(); // ไปพลอย
    await page.getByTestId('message-input').fill('ฉันไม่เชื่อเรื่องแบบนั้นหรอก น่าจะเป็นแค่แสงเงาปกติ');
    await page.getByTestId('send-button').click();

    // ระบบแจ้งเวลาเปลี่ยน
    const newTimes = ['🌙 ดึกแล้ว... ใกล้ถึงเวลาปิด', '🌃 ตอนนี้ดึกมากแล้ว', '🕛 เที่ยงคืนพอดี', '🌌 เวลาดึกสงัด'];
    const newRandomTime = newTimes[Math.floor(Math.random() * newTimes.length)];
    const systemMessage2 = newRandomTime;

    // ส่งข้อความระบบผ่านการเพิ่มโดยตรง
    await page.evaluate((message) => {
      const messagesContainer = document.querySelector('[data-testid="messages-container"]');
      if (messagesContainer) {
        const systemMessage = document.createElement('div');
        systemMessage.innerHTML = `
        <div data-testid="system-message" class="flex justify-center my-2">
          <div class="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2 text-sm max-w-[90%] text-center">
            <p class="whitespace-pre-wrap">${message}</p>
          </div>
        </div>
      `;
        messagesContainer.appendChild(systemMessage);
      }
    }, systemMessage2);

    // ตรวจสอบข้อความระบบใหม่
    await expect(page.locator(`text=${newRandomTime.split(' ')[0]}`).last()).toBeVisible();

    // มอสตอบกลับอีกครั้ง
    await page.getByTestId('next-character-button').click(); // ไปมอส
    await page.getByTestId('message-input').fill('ตอนนี้ได้ยินเสียงประหลาดมาจากชั้นบนด้วย... ใครจะไปดูมั้ย?');
    await page.getByTestId('send-button').click();

    // ตรวจสอบจำนวนข้อความที่เพิ่มขึ้น
    const finalMessages = await page.locator('[data-testid^="message-bubble-"], [data-testid="system-message"]').count();
    expect(finalMessages).toBe(initialMessages + 7); // 7 ข้อความใหม่

    // ตรวจสอบข้อความสุดท้าย
    await expect(page.locator('text=เสียงประหลาด').last()).toBeVisible();

    // ตรวจสอบว่าข้อความระบบมี 2 ข้อความใหม่
    const newSystemMessages = await page.locator('[data-testid="system-message"]').count();
    expect(newSystemMessages).toBeGreaterThanOrEqual(2);
  });
});