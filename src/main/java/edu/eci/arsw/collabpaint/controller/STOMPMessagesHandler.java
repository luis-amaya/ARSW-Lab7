package edu.eci.arsw.collabpaint.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.persistence.CollabPaintPersistence;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    @Autowired
    CollabPaintPersistence collab;

    @MessageMapping("/newpoint.{numero}")
    public void handlePointEvent(Point pt, @DestinationVariable String numero) throws Exception {
        System.out.println("Nuevo punto recibido: " + pt);
        msgt.convertAndSend("/topic/newpoint." + numero, pt);
        collab.putPointBoard(numero, pt);
        try {
            List<Point> puntos = collab.getPolygon(numero, pt);
            System.out.println("Poligono enviado" + puntos);
            msgt.convertAndSend("/topic/newpolygon." + numero, puntos);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
