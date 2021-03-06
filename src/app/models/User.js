const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Hook acontecendo antes de todo save do usuário(criação e update)
UserSchema.pre(('save'), async function (next) {
  // Se senha não foi alterada prossegue
  if (!this.isModified('password')) {
    return next()
  }

  // Se senha foi alterada, retorna hash
  this.password = await bcrypt.hash(this.password, 8)
})

// Metódos que quero que todas instâncias de usuário tenham
UserSchema.methods = {
  // Recebe senha criptografada e compara se ela bate com a senha dentro da instância do usuário
  compareHash (password) {
    return bcrypt.compare(password, this.password)
  }
}

// Método estático do model User
UserSchema.statics = {
  generateToken ({ id }) {
    // Ideal no primeiro parâmetro somente passar id, porém podem ser passadas
    // outras informações que achar importante
    // Segundo parâmetro um secret que seja único em toda a aplicação
    // para que um token não seja válido em outr aplicação que use jwt
    // Terceiro parâmetro define por quanto tempo o token é válido
    return jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.ttl
    })
  }
}
module.exports = mongoose.model('User', UserSchema)
