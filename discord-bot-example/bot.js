/**
 * Bot de Discord para generar licencias automáticamente
 * 
 * INSTALACIÓN:
 * 1. npm install discord.js axios
 * 2. Configura tu BOT_TOKEN y SELLER_KEY abajo
 * 3. node bot.js
 */

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// ========== CONFIGURACIÓN ==========
const CONFIG = {
  // Token del bot de Discord
  BOT_TOKEN: 'TU_BOT_TOKEN_AQUI',
  
  // Tu seller key (obtenerla del dashboard)
  SELLER_KEY: 'TU_SELLER_KEY_AQUI',
  
  // URL de tu KeyAuth
  API_URL: 'https://tu-keyauth.vercel.app/api/seller',
  
  // ID de la aplicación
  APP_ID: 'd-9067c98495.2478c478-3061-705e-a3d9-711e8eef025c',
  
  // Configuración por defecto de licencias
  DEFAULT_EXPIRY: 30,  // días
  DEFAULT_LEVEL: 1,
  
  // Canal donde se enviarán logs (opcional)
  LOG_CHANNEL_ID: null,
  
  // Roles que pueden usar comandos de admin
  ADMIN_ROLES: ['Admin', 'Moderator'],
};

// ========== INICIALIZAR BOT ==========
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ========== FUNCIONES DE API ==========

/**
 * Generar licencias
 */
async function generateLicenses(amount = 1, expiry = CONFIG.DEFAULT_EXPIRY, level = CONFIG.DEFAULT_LEVEL) {
  try {
    const url = `${CONFIG.API_URL}?sellerkey=${CONFIG.SELLER_KEY}&type=add&app_id=${CONFIG.APP_ID}&expiry=${expiry}&amount=${amount}&level=${level}&format=json`;
    
    const response = await axios.get(url);
    
    if (response.data.success) {
      return {
        success: true,
        licenses: response.data.data.licenses,
        count: response.data.data.count,
        expiry: response.data.data.expiry_days,
        expires_at: response.data.data.expires_at,
      };
    } else {
      return {
        success: false,
        error: response.data.message,
      };
    }
  } catch (error) {
    console.error('Error generando licencias:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Consultar balance de créditos
 */
async function checkBalance() {
  try {
    const url = `${CONFIG.API_URL}?sellerkey=${CONFIG.SELLER_KEY}&type=balance&format=json`;
    
    const response = await axios.get(url);
    
    if (response.data.success) {
      return {
        success: true,
        credits: response.data.data.credits,
        unlimited: response.data.data.unlimited,
      };
    } else {
      return {
        success: false,
        error: response.data.message,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ========== COMANDOS ==========

client.on('messageCreate', async (message) => {
  // Ignorar bots
  if (message.author.bot) return;
  
  // Solo comandos que empiecen con !
  if (!message.content.startsWith('!')) return;
  
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  // ===== COMANDO: !generar =====
  if (command === 'generar' || command === 'gen') {
    // Verificar permisos de admin
    if (!hasAdminRole(message.member)) {
      return message.reply('❌ No tienes permisos para usar este comando.');
    }
    
    const amount = parseInt(args[0]) || 1;
    const days = parseInt(args[1]) || CONFIG.DEFAULT_EXPIRY;
    
    if (amount < 1 || amount > 100) {
      return message.reply('❌ La cantidad debe estar entre 1 y 100.');
    }
    
    // Generar licencias
    await message.reply('⏳ Generando licencias...');
    
    const result = await generateLicenses(amount, days);
    
    if (result.success) {
      // Crear embed con las licencias
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Licencias Generadas')
        .setDescription(`Se generaron **${result.count}** licencia(s)`)
        .addFields(
          { name: 'Duración', value: `${result.expiry} días`, inline: true },
          { name: 'Expiran', value: new Date(result.expires_at).toLocaleDateString(), inline: true },
        )
        .setTimestamp();
      
      // Enviar licencias por DM
      try {
        const licensesText = result.licenses.join('\n');
        await message.author.send(`🔑 **Tus Licencias:**\n\`\`\`\n${licensesText}\n\`\`\``);
        await message.reply({ embeds: [embed], content: '✅ Licencias enviadas por DM' });
      } catch (error) {
        // Si no se puede enviar DM, enviar en el canal (cuidado!)
        await message.reply({ embeds: [embed], content: '⚠️ No pude enviarte DM. Las licencias están aquí:' });
        await message.channel.send(`\`\`\`\n${result.licenses.join('\n')}\n\`\`\``);
      }
      
      // Log en canal de logs
      if (CONFIG.LOG_CHANNEL_ID) {
        logAction(message.author, `Generó ${amount} licencia(s) de ${days} días`);
      }
    } else {
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(result.error)
        .setTimestamp();
      
      await message.reply({ embeds: [errorEmbed] });
    }
  }
  
  // ===== COMANDO: !balance =====
  if (command === 'balance' || command === 'creditos') {
    // Verificar permisos de admin
    if (!hasAdminRole(message.member)) {
      return message.reply('❌ No tienes permisos para usar este comando.');
    }
    
    const result = await checkBalance();
    
    if (result.success) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('💰 Balance de Créditos')
        .setDescription(result.unlimited ? '♾️ Créditos Ilimitados' : `**${result.credits}** créditos disponibles`)
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
    } else {
      await message.reply(`❌ Error: ${result.error}`);
    }
  }
  
  // ===== COMANDO: !ayuda =====
  if (command === 'ayuda' || command === 'help') {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📋 Comandos Disponibles')
      .setDescription('Bot de generación de licencias automáticas')
      .addFields(
        { 
          name: '!generar [cantidad] [días]', 
          value: 'Genera licencias\nEjemplo: `!generar 5 30`' 
        },
        { 
          name: '!balance', 
          value: 'Consulta tus créditos disponibles' 
        },
        { 
          name: '!ayuda', 
          value: 'Muestra este mensaje' 
        },
      )
      .setFooter({ text: 'Solo administradores pueden usar estos comandos' })
      .setTimestamp();
    
    await message.reply({ embeds: [embed] });
  }
});

// ========== FUNCIONES AUXILIARES ==========

/**
 * Verificar si el usuario tiene rol de admin
 */
function hasAdminRole(member) {
  if (!member) return false;
  return CONFIG.ADMIN_ROLES.some(role => 
    member.roles.cache.some(r => r.name === role)
  );
}

/**
 * Registrar acción en canal de logs
 */
async function logAction(user, action) {
  if (!CONFIG.LOG_CHANNEL_ID) return;
  
  try {
    const channel = await client.channels.fetch(CONFIG.LOG_CHANNEL_ID);
    
    const embed = new EmbedBuilder()
      .setColor('#ffff00')
      .setTitle('📝 Acción Registrada')
      .setDescription(action)
      .addFields(
        { name: 'Usuario', value: user.tag, inline: true },
        { name: 'ID', value: user.id, inline: true },
      )
      .setTimestamp();
    
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error enviando log:', error);
  }
}

// ========== EVENTOS DEL BOT ==========

client.on('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  console.log(`🔑 Seller Key: ${CONFIG.SELLER_KEY.substring(0, 8)}...`);
  console.log(`🚀 Bot listo para generar licencias!`);
  
  // Establecer estado del bot
  client.user.setActivity('!ayuda para comandos', { type: 'LISTENING' });
});

client.on('error', (error) => {
  console.error('❌ Error del bot:', error);
});

// ========== INICIAR BOT ==========
client.login(CONFIG.BOT_TOKEN);
