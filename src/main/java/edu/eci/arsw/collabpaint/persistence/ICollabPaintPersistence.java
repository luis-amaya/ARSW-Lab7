package edu.eci.arsw.collabpaint.persistence;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import edu.eci.arsw.collabpaint.model.Point;

@Service
public class ICollabPaintPersistence implements CollabPaintPersistence {

    ConcurrentHashMap<String, List<Point>> boards = new ConcurrentHashMap<>();

    @Override
    public List<Point> getPolygon(String numero, Point pt) throws CollabPaintException {
        if (boards.containsKey(numero)) {
            if (!(boards.get(numero).size() >= 3)) {
                throw new CollabPaintException("This board, doesn't have more than three points");
            }
            return boards.get(numero);
        } else {
            throw new CollabPaintException("Board Number: " + numero + " not found");
        }
    }

    @Override
    public void putPointBoard(String numero, Point pt) {
        if (!boards.containsKey(numero)) {
            List<Point> points = new ArrayList<Point>() {
                {
                    add(pt);
                }
            };
            boards.put(numero, points);
        } else {
            boards.get(numero).add(pt);
        }

    }

}
