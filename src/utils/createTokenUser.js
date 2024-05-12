const createTokenUser = (user) => {
  return {
    email: user.email,
    phoneNumber: user.phoneNumber,
    coins: user.coins,
    id: user._id,
    role: user.role,
    favorites: user.favorites,
    employer: user.employer,
    jobSeeker: user.jobSeeker,
    service: user.service,
    avatar: user.avatar,
    mobileToken: user.mobileToken,
  };
};

module.exports = createTokenUser;
