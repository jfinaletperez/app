import emailjs from '@emailjs/browser';

// Estas son las credenciales para configurar EmailJS. 
// El usuario puede obtener estas claves de forma gratuita en https://www.emailjs.com/
const EMAILJS_SERVICE_ID = 'service_ya8le79';
const EMAILJS_TEMPLATE_ID = 'template_sq54t2j';
const EMAILJS_PUBLIC_KEY = 'aqWQgR98oALaOJs7j';

export interface InvitationData {
    to_name: string;
    to_email: string;
    company_name: string;
    role: string;
    job_title: string;
    invite_link: string;
}

export const sendInvitationEmail = async (data: InvitationData): Promise<{ success: boolean; message: string }> => {
    // Si no se han configurado las claves reales, usamos un fallback a mailto para que el usuario no se quede bloqueado
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY.includes('YOUR_')) {
        const subject = encodeURIComponent(`Invitación a unirse a ${data.company_name} en ShiftMaster Pro`);
        const body = encodeURIComponent(
            `Hola ${data.to_name},\n\n` +
            `Has sido invitado a unirte al equipo de ${data.company_name} como ${data.job_title} (${data.role}).\n\n` +
            `Para crear tu perfil y acceder a la plataforma, por favor haz clic en el siguiente enlace:\n` +
            `${data.invite_link}\n\n` +
            `¡Bienvenido a bordo!`
        );
        window.location.href = `mailto:${data.to_email}?subject=${subject}&body=${body}`;
        return { success: true, message: 'Se ha abierto tu cliente de correo para enviar la invitación.' };
    }

    try {
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                ...data
            },
            EMAILJS_PUBLIC_KEY
        );
        return { success: true, message: 'La invitación ha sido enviada con éxito al correo del trabajador.' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: 'Hubo un error al enviar el correo automático. Inténtalo de nuevo más tarde.' };
    }
};
