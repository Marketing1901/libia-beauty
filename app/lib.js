export const eligible=['Color','Highlights','Botox','Keratina'];
export const defaultConfig={visit_text:'Completa 5 visitas y disfruta un tratamiento de color de cortesía.',ref_text:'Cada amiga que nos visite te acerca a tu próxima recompensa.',ref_reward:'5 referidos → regalo especial',booking_label:'Agendar cita por WhatsApp',booking_url:'https://wa.me/13474727477?text=Hola%20Libia%20Beauty%20Salon%2C%20quisiera%20agendar%20una%20cita.',contact_label:'Contáctanos',contact_url:'tel:+13474727477'};
export function digits(v=''){return v.replace(/\D/g,'')}
export function stars(v=0){return Math.min(5,Math.max(0,v))}
