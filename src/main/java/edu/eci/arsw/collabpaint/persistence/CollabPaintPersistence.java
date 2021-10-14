package edu.eci.arsw.collabpaint.persistence;

import java.util.List;

import org.springframework.stereotype.Service;

import edu.eci.arsw.collabpaint.model.Point;

public interface CollabPaintPersistence {
    public List<Point> getPolygon(String numero, Point pt) throws CollabPaintException;

    public void putPointBoard(String numero, Point pt);
}
