package co.edu.uan.fraudguard.analysis.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Value("${fraudguard.queues.transactions}")
    private String transactionsQueue;

    @Value("${fraudguard.queues.alerts}")
    private String alertsQueue;

    /** Cola de la que este servicio CONSUME (transacciones). */
    @Bean
    public Queue transactionsQueue() {
        return new Queue(transactionsQueue, true);
    }

    /** Cola a la que este servicio PUBLICA (alertas). */
    @Bean
    public Queue alertsQueue() {
        return new Queue(alertsQueue, true);
    }

    /** Convierte mensajes RabbitMQ a/desde JSON automáticamente. */
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /** Cliente HTTP para llamar al Rule Engine de forma síncrona. */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
