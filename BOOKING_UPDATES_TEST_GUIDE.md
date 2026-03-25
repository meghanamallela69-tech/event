# 🧪 Quick Test Guide - Booking Model Updates

## What Changed?
1. ✅ **Time Picker**: Now uses 24-hour time selector instead of fixed slots
2. ✅ **Promo Code**: Clearly marked as optional with better UX

---

## How to Test

### Test 1: Time Picker Functionality

#### Steps:
1. Start frontend server
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to any full-service event

3. Click "Book Service" button

4. Fill in the form:
   - Select a date (any future date)
   - Click on the **time input** field

#### Expected Result:
- ✅ Native time picker should appear
- ✅ Can select any hour and minute
- ✅ Cannot select past times (browser prevents)
- ✅ After selecting, shows "Selected time: X:XX AM/PM" below input

#### Example:
```
You select: 14:30
Display shows: "Selected time: 2:30 PM"
Backend receives: eventTime: "14:30"
```

---

### Test 2: Promo Code Optional Field

#### Steps:
1. In the same booking form
2. Scroll to "Promo Code (Optional)" section
3. Leave it empty and try to continue

#### Expected Result:
- ✅ Label clearly shows "(Optional)"
- ✅ Help text visible: "No promo code? Skip this step..."
- ✅ Apply button is grayed out (disabled)
- ✅ Cursor shows "not-allowed" when hovering over disabled button
- ✅ Can still submit booking without entering code

---

### Test 3: Promo Code With Valid Code

#### Steps:
1. Enter "EVENT10" in promo field
2. Click Apply button

#### Expected Result:
- ✅ Button becomes enabled when typing starts
- ✅ Click Apply → Discount applied
- ✅ Success message: "Promo applied! You saved ₹X"
- ✅ Discount shown in price breakdown
- ✅ Final total updates with discount

---

### Test 4: Complete Booking Flow

#### Steps:
1. Fill entire booking form:
   - Date: Any future date
   - Time: Select any time (e.g., 15:45)
   - Location: Enter address or use current location
   - Add-ons: Optional (select if available)
   - Promo Code: Leave empty OR enter code

2. Click "Request Booking"

#### Expected Backend Data:
```javascript
{
  serviceId: "...",
  serviceTitle: "...",
  eventType: "full-service",
  eventDate: "2026-03-30",
  eventTime: "15:45",  // ← String format HH:MM
  location: "...",
  selectedAddOns: [...],
  totalAmount: 5000,
  promoCode: null,  // or "EVENT10" if entered
  discount: 0,      // or 500 if code used
  status: "pending"
}
```

---

## Browser-Specific Tests

### Chrome/Edge:
- Time picker appears as popup clock interface
- Clean, modern design
- Smooth interaction

### Firefox:
- Similar time picker interface
- Slightly different styling
- Same functionality

### Safari:
- iOS-style scroll wheels on Mac
- Native macOS time picker
- Full functionality

### Mobile (iOS/Android):
- Touch-optimized time picker
- Scroll wheel on iOS
- Material Design picker on Android
- No keyboard appears (better UX)

---

## Common Issues & Solutions

### Issue 1: Time picker not appearing
**Check:**
- Browser supports `<input type="time">`
- JavaScript is enabled
- No console errors

**Solution:** Update browser or use modern browser

---

### Issue 2: Can't select time in past
**This is intentional!** The `min` attribute prevents selecting past dates/times.

**Test:** Try selecting yesterday's date - shouldn't be possible

---

### Issue 3: Time format confusion
**Backend receives:** "14:30" (24-hour format)
**User sees:** "2:30 PM" (12-hour display)

The `formatTimeDisplay()` function handles conversion automatically.

---

### Issue 4: Promo button always disabled
**Check:**
- Input value is being set
- Whitespace trimming works
- React state updates correctly

**Test:** Type "EVENT10" → Button should enable immediately

---

### Issue 5: Help text not showing
**Verify:**
- Conditional rendering syntax correct
- No JSX errors in console
- Component re-renders on state change

**Check:** Look for help text when input is empty

---

## Visual Verification Checklist

### Time Selection:
- [ ] Input field has clock icon 🕐
- [ ] Label says "Select Time (within 24 hours)"
- [ ] Time picker opens on click
- [ ] Selected time displays below input
- [ ] Format is "H:MM AM/PM" (e.g., "2:30 PM")
- [ ] Can't select past times
- [ ] Styling matches other form fields

### Promo Code:
- [ ] Label includes "% Promo Code (Optional)"
- [ ] Placeholder: "Enter code if you have one..."
- [ ] Apply button disabled when empty
- [ ] Help text visible: "No promo code? Skip..."
- [ ] Button enables when typing
- [ ] Discount shows when applied
- [ ] Success toast on valid code

---

## Mobile Testing

### iOS Safari:
1. Tap time input → Scroll wheel appears
2. Scroll to select hour
3. Scroll to select minute
4. Tap Done
5. Shows "Selected time: 2:30 PM"

### Android Chrome:
1. Tap time input → Material picker appears
2. Tap hour, tap minute
3. Tap OK
4. Shows "Selected time: 2:30 PM"

### Responsive Design:
- [ ] Form fits mobile screen
- [ ] Inputs are touch-friendly (large enough)
- [ ] Text is readable (16px+)
- [ ] Buttons are easily tappable
- [ ] Help text wraps properly

---

## Desktop Testing

### Keyboard Navigation:
1. Tab to time input
2. Press Space or Enter → Picker opens
3. Use arrow keys to navigate
4. Press Enter to select

### Mouse Navigation:
1. Click time input → Picker appears
2. Click hour, click minute
3. Click outside to close

### All Browsers:
- [ ] Chrome: Works ✓
- [ ] Firefox: Works ✓
- [ ] Edge: Works ✓
- [ ] Safari: Works ✓

---

## Integration Testing

### Frontend → Backend Flow:

1. **User fills form:**
   - Time: 15:45
   - Promo: (empty)

2. **Frontend sends:**
   ```javascript
   POST /api/bookings
   {
     eventTime: "15:45",
     promoCode: null
   }
   ```

3. **Backend creates booking:**
   ```javascript
   {
     eventTime: "15:45",
     payment: { paid: false }
   }
   ```

4. **Database stores:**
   - `eventTime: "15:45"` (String)
   - Correct schema compliance ✓

---

## Performance Testing

### Load Time:
- Modal opens instantly
- Time picker loads immediately
- No lag when selecting time
- Smooth animations

### State Updates:
- Time selection updates immediately
- Display text updates in real-time
- Promo button state changes instantly
- No delayed re-renders

---

## Accessibility Testing

### Screen Reader:
- Label announces "Select Time within 24 hours"
- Promo code announces "Optional"
- Help text is read
- Button state announced ("disabled", "enabled")

### Keyboard Only:
- Can tab to all fields
- Can open time picker with keyboard
- Can apply promo code with Enter key
- Can submit form with Enter

---

## Success Criteria

After testing, you should confirm:

✅ Time picker works on all browsers
✅ Can select any time within 24 hours
✅ Past times are automatically blocked
✅ Selected time displays in user-friendly format
✅ Promo code field clearly marked as optional
✅ Help text guides users without code
✅ Apply button disabled when no code entered
✅ Can complete booking without promo code
✅ Backend receives correct data format
✅ No console errors
✅ Mobile-friendly on all devices
✅ Accessible to all users

---

## Quick Manual Test (30 seconds)

1. Open booking modal
2. Click time input → Should see picker
3. Select 14:30 → Should show "2:30 PM"
4. Leave promo empty → Should see help text
5. Submit booking → Should succeed

**If all 5 steps pass: Changes are working correctly!** ✅

---

## Automated Test Script (Optional)

```javascript
// In browser console during booking
const timeInput = document.querySelector('input[type="time"]');
const promoInput = document.querySelector('input[placeholder*="code"]');
const applyButton = document.querySelector('button:contains("Apply")');

console.log('Time input exists:', !!timeInput);
console.log('Promo input exists:', !!promoInput);
console.log('Apply button disabled:', applyButton?.disabled);

// Simulate time selection
timeInput.value = '14:30';
timeInput.dispatchEvent(new Event('change', { bubbles: true }));
console.log('Time selected:', timeInput.value);

// Check display text
setTimeout(() => {
  const displayText = document.querySelector('*[class*="Selected time"]');
  console.log('Display text:', displayText?.textContent);
}, 100);
```

---

## Report Template

```
TEST RESULTS - Booking Model Updates
=====================================

Browser: Chrome/Firefox/Safari/Other
Device: Desktop/Mobile/Tablet
OS: Windows/Mac/Linux/iOS/Android

Time Picker:
✓ Opens correctly
✓ Can select time
✓ Displays formatted time
✓ Blocks past times
✓ Mobile-friendly

Promo Code:
✓ Clearly marked optional
✓ Help text visible
✓ Button disabled when empty
✓ Enables when typing
✓ Applies discount correctly

Overall:
✓ No console errors
✓ Fast performance
✓ Responsive design
✓ Accessible

Issues Found: None / [List any]

Status: PASS / FAIL
```

---

## Next Steps After Testing

If all tests pass:
1. ✅ Deploy to production
2. ✅ Monitor user feedback
3. ✅ Track booking completion rates
4. ✅ Check for any edge cases

If tests fail:
1. ❌ Document specific failures
2. ❌ Check browser console for errors
3. ❌ Verify code changes applied correctly
4. ❌ Review BOOKING_MODEL_UPDATES_SUMMARY.md

---

## Support

For issues or questions:
- Check BOOKING_MODEL_UPDATES_SUMMARY.md for detailed documentation
- Review code changes in BookingModal.jsx
- Inspect browser console for errors
- Verify backend API accepts new time format
