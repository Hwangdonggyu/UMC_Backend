const User = require("../models/User");
const bcrypt = require("bcrypt");

// 프로필 페이지 (Demo)
exports.profilePage = async (req, res) => {
	return res.status(200).render('profile.ejs', { user: req.session.user });
}
exports.pweditPage = async (req, res) => {
	return res.status(200).render('pwedit.ejs', { user: req.session.user });
}

// 비밀번호 변경, 회원 탈퇴
exports.passwordEdit = async (req, res) => {
	const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findById(req.session.user._id);

        // 현재 비밀번호 일치 여부 확인
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "기존의 비밀번호와 일치하지 않습니다.", success: false });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "새 비밀번호가 일치하지 않습니다.", success: false });
        }

        // 새 비밀번호 암호화 및 저장
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });

        console.log({ message : "비밀번호가 변경되었습니다." });
        return res.status(200).json({ message: "비밀번호가 변경되었습니다.", success: true, redirect: "/profile" });

    } catch (error) {
        console.error('Error in passwordEdit.', error);
        return res.status(500).json({ error: 'Server error', success: false });
    }
}
exports.deleteUser = async (req, res) => {
	try {
        const user = await User.findByIdAndDelete(req.session.user._id);
        if (!user) {
            return res.status(400).json({ error: "회원정보를 찾을 수 없습니다.", success: false });
        }

        // 세션에서 사용자 정보 제거
        req.session.destroy();

		console.log({ message : "Delete user" });
        return res.status(200).json({ message: "회원정보가 삭제되었습니다.", success: true, redirect: "/login" });
    } catch (error) {
        console.error("Error in deleteUser.", error);
        return res.status(500).json({ error: "Server error", success: false });
    }
}