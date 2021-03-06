import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Hash from '@ioc:Adonis/Core/Hash'

//Model
import User from 'App/Models/User';
import VerifyEmailToken from 'App/Models/VerifyEmailToken';

//Validators
import CreateUserValidator from 'App/Validators/CreateUserValidator';
import UpdateUserValidator from 'App/Validators/UpdateUserValidator';

//Mailer Service
import Mail from '@ioc:Adonis/Addons/Mail';

export default class UsersController {
    public async index({ response }: HttpContextContract) {
        try {
            const allUsers = await User.all();

            return response.status(200).json({
                allUsers
            });
        } catch (error) {
            return response.badRequest(error);
        };
    };

    public async store({ request, response }: HttpContextContract) {
        const { username, email, password } = request.body();

        try {
            await request.validate(CreateUserValidator);

            const existingEmail = await User.findBy('email', email);
            if (existingEmail) return response.badRequest({
                message: 'Email already in use.'
            });

            const newUser = await User.create({
                username,
                email,
                password,
                verified: false
            });

            if (!newUser) return response.badRequest({
                message: 'Something went wrong.'
            });

            function generateToken(n: number) {
                const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let authToken = '';
                for (var i = 0; i < n; i++) {
                    authToken += chars[Math.floor(Math.random() * chars.length)];
                };
                return { authToken };
            };

            const { authToken } = generateToken(27);

            await VerifyEmailToken.create({
                token: String(authToken),
                user_id: newUser.id
            });

            await Mail.send(message => {
                message
                    .from('AdonisHere@back-end.com')
                    .to(email)
                    .subject('Welcomido')
                    .htmlView('emails/welcome', {
                        username,
                        email,
                        link: `http://127.0.0.1:3333/users/verify/${authToken}`
                    })
            });

            return response.created({
                message: 'User created.'
            });

        } catch (error) {
            return response.badRequest(error);
        };
    };

    public async show({ params, response }: HttpContextContract) {
        const { id } = params;

        try {
            const user = await User.findBy('id', id);
            if (!user) return response.badRequest({
                message: 'User not found.'
            });

            return response.status(200).json({
                user
            });
        } catch (error) {
            return response.badRequest(error);
        };
    };

    public async update({ params, request, response }: HttpContextContract) {
        const { username, email, password } = request.body();
        const { id } = params;

        try {
            if (!id) return response.badRequest({
                message: 'User not found.'
            });

            const user = await User.findBy('id', id);
            if (!user) return response.badRequest({
                message: 'User not found.'
            });

            if (username) {
                await request.validate(UpdateUserValidator);
                user.username = username;
            };

            if (email && email !== user.email) {
                await request.validate(UpdateUserValidator);
                const existingEmail = await User.findBy('email', email);
                if (existingEmail) return response.badRequest({
                    message: 'Email already in use.'
                });
                user.email = email.toLowerCase();
            };

            if (password) {
                await request.validate(UpdateUserValidator);
                user.password = password;
            };

            await user.save();

            const userUpdated = {
                username: user.username,
                email: user.email
            };

            return response.status(200).json({
                message: 'User updated successfully',
                user: userUpdated
            });

        } catch (error) {
            return response.badRequest(error);
        };
    };

    public async destroy({ params, request, response }: HttpContextContract) {
        const { id } = params;
        const { password } = request.body();

        try {
            if (!id) return response.badRequest({
                message: 'User not found.'
            });

            const user = await User.findBy('id', id);
            if (!user) return response.badRequest({
                message: 'User not found.'
            });

            if (!password) return response.badRequest({
                message: 'Invalid password.'
            });

            const passwordCompare = await Hash.verify(user.password, password);
            if (!passwordCompare) return response.badRequest({
                message: 'Invalid password.'
            });

            await user.delete();

            return response.status(200).json({
                message: 'User deleted successfully.'
            });
        } catch (error) {
            return response.badRequest(error);
        };
    };
};

