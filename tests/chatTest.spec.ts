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
  test('should handle long group conversation with dynamic time/location changes', async ({ page }) => {
    // สร้างตัวละครเพิ่ม 3 ตัว (รวมตัวละครเริ่มต้น 2 ตัว จะมีทั้งหมด 5 ตัว)
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

    // สร้างตัวละครที่ 5
    await page.getByTestId('add-character-button').click();
    await page.getByTestId('character-id-input').fill('char5');
    await page.getByTestId('character-name-input').fill('เปา');
    await page.getByTestId('character-avatar-input').fill('👨‍🔧');
    await page.getByTestId('color-option-เทา').click();
    await page.getByTestId('character-personality-input').fill('ช่างซ่อมใจดี');
    await page.getByTestId('save-character-button').click();

    await page.getByTestId('close-settings-button').click();

    // เก็บจำนวน system messages เริ่มต้น (มี 1 ข้อความ)
    const initialSystemMessages = await page.locator('[data-testid="system-message"]').count();

    // ฟังก์ชันสุ่มสถานที่และเวลา
    const getRandomLocation = () => {
      const locations = [
        'ห้องสมุดมหาวิทยาลัย', 'คาเฟ่ย่านเมืองเก่า', 'สวนสาธารณะกลางเมือง',
        'หอพักนักศึกษา', 'อาคารเรียนเก่า', 'โรงอาหารกลาง', 'ห้องปฏิบัติการคอมพิวเตอร์',
        'หอศิลป์', 'สนามกีฬา', 'ลานกิจกรรมนักศึกษา'
      ];
      return locations[Math.floor(Math.random() * locations.length)];
    };

    const getRandomTime = () => {
      const times = [
        '🌞 เช้าวันจันทร์ที่สดใส', '🌆 ยามเย็นวันศุกร์', '🌙 คืนวันเสาร์อันเงียบสงบ',
        '☀️ ตอนเที่ยงวันอาทิตย์', '🌧️ เช้าฝนพรำวันอังคาร', '🌫️ คืนหมอกหนาววันพุธ',
        '⛅ บ่ายวันพฤหัสที่แจ่มใส', '🌃 ดึกสงัดของคืนวันศุกร์', '🌇 เวลาพลบค่ำวันเสาร์',
        '🌌 เวลาเที่ยงคืนวันอาทิตย์'
      ];
      return times[Math.floor(Math.random() * times.length)];
    };

    // ฟังก์ชันเพิ่มข้อความระบบ
    const addSystemMessage = async (message: string) => {
      await page.evaluate((msg) => {
        const messagesContainer = document.querySelector('[data-testid="messages-container"]');
        if (messagesContainer) {
          const systemMessage = document.createElement('div');
          systemMessage.innerHTML = `
                <div data-testid="system-message" class="flex justify-center my-2">
                    <div class="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2 text-sm max-w-[90%] text-center">
                        <p class="whitespace-pre-wrap">${msg}</p>
                    </div>
                </div>
            `;
          messagesContainer.appendChild(systemMessage);
        }
      }, message);
    };

    // เริ่มเรื่อง
    const startLocation = getRandomLocation();
    const startTime = getRandomTime();
    await addSystemMessage(`${startTime} ใน${startLocation}`);

    // ตัวละครทั้งหมด (ไม่รวมระบบ)
    const characters = ['มอส', 'มายา', 'นัท', 'พลอย', 'เปา'];

    // ตัวชี้ตัวละครปัจจุบัน
    let currentCharacterIndex = 0;

    // สนทนากลุ่ม - 30 ข้อความ
    for (let i = 0; i < 30; i++) {
      // เปลี่ยนตัวละครทุก 3 ข้อความ (ข้อความที่ 0, 3, 6, ...)
      if (i % 3 === 0) {
        // เปลี่ยนไปตัวละครถัดไปแบบวนรอบ
        currentCharacterIndex = (currentCharacterIndex + 1) % characters.length;

        // คลิกปุ่มเปลี่ยนตัวละครจนกว่าจะถึงตัวละครที่ต้องการ
        let currentCharacterName = await page.getByTestId('current-character-name').innerText();
        while (currentCharacterName !== characters[currentCharacterIndex]) {
          await page.getByTestId('next-character-button').click();
          currentCharacterName = await page.getByTestId('current-character-name').innerText();
          await page.waitForTimeout(100); // รอสักครู่ให้ UI อัปเดต
        }
      }

      // เปลี่ยนเวลา/สถานที่ทุก 5 ข้อความ
      if (i % 5 === 0 && i > 0) {
        const newLocation = getRandomLocation();
        const newTime = getRandomTime();
        await addSystemMessage(`${newTime} ใน${newLocation}`);
      }

      // เนื้อหาข้อความตามลำดับเรื่อง
      let message = '';
      const currentCharacterName = characters[currentCharacterIndex];

      switch (i) {
        case 0:
          message = 'ทุกคนได้ยินข่าวลือเรื่องห้องสมุดตอนดึกมั้ย?';
          break;
        case 1:
          message = 'ฉันได้ยินมาว่ามีบางคนเห็นเงารูปแปลกๆ ในห้องสมุดตอนเที่ยงคืน!';
          break;
        case 2:
          message = 'ไม่นะ! ผมต้องมาทำงานตอนดึกบ่อยๆ นะเนี่ย 😱';
          break;
        case 3:
          message = 'ฉันไม่เชื่อเรื่องแบบนั้นหรอก น่าจะเป็นแค่แสงเงาปกติ';
          break;
        case 4:
          message = 'ผมเห็นด้วยกับพลอย มันต้องมีคำอธิบายทางวิทยาศาสตร์';
          break;
        case 5:
          message = 'แต่เรื่องราวมันน่ากลัวมากนะ! มีคนบอกว่าได้ยินเสียงเดินตามหลัง...';
          break;
        case 6:
          message = 'บางทีอาจเป็นลมพัดผ่านหน้าต่างที่เปิดไว้';
          break;
        case 7:
          message = 'ผมว่าถ้าเราอยากรู้จริงๆ เราควรไปสำรวจกันดูสักครั้ง';
          break;
        case 8:
          message = 'ฉันไม่แน่ใจนะ มันอาจจะอันตรายเกินไป';
          break;
        case 9:
          message = 'นั่นสิ! เราไม่รู้อะไรเกี่ยวกับสิ่งนั้นเลย';
          break;
        case 10:
          message = 'เราจะไปกันหลายคนก็ไม่น่ามีปัญหา';
          break;
        case 11:
          message = 'ถ้าอย่างนั้นผมขอไปด้วยคน';
          break;
        case 12:
          message = 'ฉันก็ไปด้วย แต่อย่าลืมนำไฟฉายมานะ';
          break;
        case 13:
          message = 'เอาล่ะ ตกลงวันนี้ตอนสามทุ่มตรงนี้';
          break;
        case 14:
          message = 'รอเดี๋ยวนะ เราไม่ควรเตรียมตัวอะไรเพิ่มเติมเหรอ?';
          break;
        case 15:
          message = 'ผมว่าจะเอากล้องถ่ายรูปอินฟราเรดมาด้วย';
          break;
        case 16:
          message = 'ดีเลย! เผื่อเราจะได้หลักฐานชัดๆ';
          break;
        case 17:
          message = 'อย่าลืมนำเสบียงมาด้วยนะ ฉันจะเตรียมขนม';
          break;
        case 18:
          message = 'ผมจะเอาเครื่องบันทึกเสียงมา เผื่อมีเสียงแปลกๆ';
          break;
        case 19:
          message = 'ตอนนี้ฉันเริ่มตื่นเต้นแล้วล่ะ!';
          break;
        case 20:
          message = 'ผมก็ด้วย ถึงจะกลัวนิดหน่อยแต่ก็ตื่นเต้น';
          break;
        case 21:
          message = 'ทุกคนพร้อมกันยัง? ใกล้ถึงเวลาสามทุ่มแล้วนะ';
          break;
        case 22:
          message = 'ผมพร้อมแล้ว กำลังรออยู่หน้าห้องสมุด';
          break;
        case 23:
          message = 'ฉันกำลังไป เดี๋ยวถึงในห้านาที';
          break;
        case 24:
          message = 'ผมก็กำลังมา ฝนเริ่มตกแล้วขับรถลำบากหน่อย';
          break;
        case 25:
          message = 'ฝนตกแบบนี้ยิ่งเพิ่มบรรยากาศน่ากลัวเลยนะ';
          break;
        case 26:
          message = 'อย่าพูดแบบนั้นสิ ฉันเริ่มขนลุกแล้ว!';
          break;
        case 27:
          message = 'ทุกคนถึงกันครบแล้ว เราเข้าไปกันเลยมั้ย?';
          break;
        case 28:
          message = 'รอเดี๋ยว ผมต้องตั้งค่ากล้องก่อน';
          break;
        case 29:
          message = 'โอเค เริ่มเดินหน้าไปพร้อมกันนะ!';
          break;
        default:
          message = `ข้อความที่ ${i + 1} จาก ${currentCharacterName}`;
      }

      await page.getByTestId('message-input').fill(message);
      await page.getByTestId('send-button').click();

      // รอสักครู่ระหว่างข้อความ
      await page.waitForTimeout(300);
    }

    // เพิ่มข้อความระบบปิดท้ายเรื่อง
    await addSystemMessage('🌌 เวลาล่วงเลยผ่านเที่ยงคืน... ความลึกลับยังคงรอการค้นพบ');

    // ตรวจสอบข้อความสุดท้าย
    await expect(page.locator('text=ความลึกลับยังคงรอการค้นพบ').last()).toBeVisible();
  });
});