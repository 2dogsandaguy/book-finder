const { User, AuthenticationError } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You are not logged in');
    },
  },
  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      // If there is no user with that email address, throw an Authentication error stating so
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      // If there is a user found, execute the `isCorrectPassword` instance method and check if the correct password was provided
      const correctPw = await user.isCorrectPassword(password);

      // If the password is incorrect, throw an Authentication error stating so
      if (!correctPw) {
        throw new AuthenticationError('Invalid credentials');
      }

      // If email and password are correct, sign the user into the application with a JWT
      const token = signToken(user);

      // Return an `Auth` object that consists of the signed token and user's information
      return { token, user };
    },
    addUser: async (_, { username, email, password }) => {
      // First, create the user
      const user = await User.create({ username, email, password });
      // To reduce friction for the user, immediately sign a JSON Web Token and log the user in after they are created
      const token = signToken(user);
      // Return an `Auth` object that consists of the signed token and user's information
      return { token, user };
    },
    saveBook: async (_, { bookInput }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookInput } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('You are not logged in');
    },
    removeBook: async (_, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('You are not logged in');
    },
  },
};

module.exports = resolvers;
