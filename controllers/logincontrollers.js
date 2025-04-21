const { Scout, Player } = require('../modelss/Schema');
const bcrypt = require('bcrypt');

const userLogin = (req, res) => {
  res.render("pages/login", { errorMessage: null }); // Initialize with no error message
};

const UserLoginPost = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        const trimmedPhoneNumber = phoneNumber.trim();

        if (!trimmedPhoneNumber || !password) {
            return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
        }

        let user = await Scout.findOne({ phoneNumber: trimmedPhoneNumber });

        if (!user) {
            user = await Player.findOne({ phoneNumber: trimmedPhoneNumber });
        }

        if (!user) {
            return res.status(200).json({ success: false, message: 'المستخدم غير مسجل' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(200).json({ success: false, message: 'كلمة المرور غير صحيحة' });
        }

        req.session.userName = user.name;
        req.session.userId = user._id;
        req.session.accountType = user.accountType;

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
    }
};


module.exports = { userLogin, UserLoginPost };
