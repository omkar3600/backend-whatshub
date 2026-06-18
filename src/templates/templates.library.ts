export const PRE_APPROVED_TEMPLATES = [
    {
        id: 'lib_abandoned_cart_1',
        name: 'Abandoned Cart Offer',
        industry: 'E-commerce',
        templateName: 'abandoned_cart_recovery',
        category: 'MARKETING',
        language: 'en_US',
        headerType: 'NONE',
        headerText: '',
        bodyText: 'Hi {{1}}, we noticed you left some great items in your cart! 🛒\n\nComplete your purchase today and get {{2}}% OFF using code {{3}}.\n\nTap the button below to checkout now.',
        footerText: 'Reply STOP to unsubscribe.',
        buttons: [
            { type: 'URL', text: '🛒 Checkout Now', url: 'https://yourwebsite.com/cart' }
        ],
        sampleValues: ['John', '15', 'SAVE15']
    },
    {
        id: 'lib_order_confirmation',
        name: 'Order Confirmation',
        industry: 'E-commerce',
        templateName: 'order_confirmation_v1',
        category: 'UTILITY',
        language: 'en_US',
        headerType: 'TEXT',
        headerText: 'Order Confirmed! 🎉',
        bodyText: 'Great news, {{1}}!\n\nYour order #{{2}} has been successfully placed. We are packing it up and will notify you once it ships.\n\nThank you for shopping with {{3}}!',
        footerText: 'Keep this message for your records.',
        buttons: [
            { type: 'URL', text: '📦 Track Order', url: 'https://yourwebsite.com/track' }
        ],
        sampleValues: ['Jane', 'ORD-99812', 'OurStore']
    },
    {
        id: 'lib_product_launch',
        name: 'New Product Launch',
        industry: 'Retail',
        templateName: 'new_product_launch',
        category: 'MARKETING',
        language: 'en_US',
        headerType: 'IMAGE',
        headerText: '',
        bodyText: 'Hi {{1}}, the wait is over! 🎉\n\nOur highly anticipated {{2}} is finally available.\n\nGrab yours before it sells out again!',
        footerText: 'Reply STOP to unsubscribe.',
        buttons: [
            { type: 'URL', text: '✨ Shop Now', url: 'https://yourwebsite.com/new' }
        ],
        sampleValues: ['Sarah', 'Summer Collection']
    },
    {
        id: 'lib_webinar_reminder',
        name: 'Webinar Reminder',
        industry: 'Education',
        templateName: 'webinar_reminder_alert',
        category: 'UTILITY',
        language: 'en_US',
        headerType: 'NONE',
        headerText: '',
        bodyText: 'Hello {{1}},\n\nJust a quick reminder that your masterclass on {{2}} starts in 1 hour at {{3}}.\n\nHave your notebook ready! 📝',
        footerText: 'Powered by EdTech Platform',
        buttons: [
            { type: 'URL', text: '🔗 Join Webinar', url: 'https://zoom.us/join' }
        ],
        sampleValues: ['Michael', 'Digital Marketing', '4:00 PM']
    },
    {
        id: 'lib_appointment_reminder',
        name: 'Appointment Reminder',
        industry: 'Health & Wellness',
        templateName: 'clinic_appointment_reminder',
        category: 'UTILITY',
        language: 'en_US',
        headerType: 'NONE',
        headerText: '',
        bodyText: 'Hi {{1}},\n\nYour appointment with Dr. {{2}} is confirmed for {{3}} at {{4}}.\n\nPlease reply with "1" to confirm or "2" to reschedule.',
        footerText: 'Please arrive 10 minutes early.',
        buttons: [
            { type: 'QUICK_REPLY', text: 'Confirm' },
            { type: 'QUICK_REPLY', text: 'Reschedule' }
        ],
        sampleValues: ['David', 'Smith', 'Oct 24th', '10:00 AM']
    },
    {
        id: 'lib_payment_reminder',
        name: 'Payment Reminder',
        industry: 'Finance / SaaS',
        templateName: 'payment_due_reminder',
        category: 'UTILITY',
        language: 'en_US',
        headerType: 'TEXT',
        headerText: 'Payment Due ⚠️',
        bodyText: 'Hi {{1}},\n\nThis is a gentle reminder that your payment of {{2}} for invoice #{{3}} is due on {{4}}.\n\nPlease pay via the link below to avoid late fees.',
        footerText: 'Ignore if already paid.',
        buttons: [
            { type: 'URL', text: '💳 Pay Now', url: 'https://yourwebsite.com/pay' }
        ],
        sampleValues: ['Emily', '$49.99', 'INV-5542', 'Oct 25th']
    }
];
