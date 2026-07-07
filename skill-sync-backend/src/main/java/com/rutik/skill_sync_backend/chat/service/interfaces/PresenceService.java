package com.rutik.skill_sync_backend.chat.service.interfaces;


public interface PresenceService {


    void handleUserConnect(Long userId);


    void handleUserDisconnect(Long userId);


    boolean isUserOnline(Long userId);
}
