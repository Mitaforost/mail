PGDMP      3                }            mail    17.4    17.2 8    `           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            a           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            b           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            c           1262    25092    mail    DATABASE     j   CREATE DATABASE mail WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'ru-RU';
    DROP DATABASE mail;
                     postgres    false            �            1255    25183    archive_old_messages() 	   PROCEDURE       CREATE PROCEDURE public.archive_old_messages()
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE message_folders
    SET folder = 'архив'
    WHERE message_id IN (
        SELECT id FROM messages WHERE sent_at < NOW() - INTERVAL '6 months'
    );
END;
$$;
 .   DROP PROCEDURE public.archive_old_messages();
       public               postgres    false            �            1255    25176    distribute_message_folders()    FUNCTION     6  CREATE FUNCTION public.distribute_message_folders() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Добавляем письмо в "Отправленные" для отправителя
    INSERT INTO message_folders (message_id, user_id, folder)
    VALUES (NEW.id, NEW.sender_id, 'отправленные');

    -- Добавляем письмо в "Входящие" для получателя
    INSERT INTO message_folders (message_id, user_id, folder)
    VALUES (NEW.id, NEW.receiver_id, 'входящие');

    RETURN NEW;
END;
$$;
 3   DROP FUNCTION public.distribute_message_folders();
       public               postgres    false            �            1255    25182    get_unread_count(integer)    FUNCTION       CREATE FUNCTION public.get_unread_count(p_user_id integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE unread_count INT;
BEGIN
    SELECT COUNT(*) INTO unread_count
    FROM message_status
    WHERE user_id = p_user_id AND is_read = FALSE;
    RETURN unread_count;
END;
$$;
 :   DROP FUNCTION public.get_unread_count(p_user_id integer);
       public               postgres    false            �            1255    25178    mark_as_read()    FUNCTION     �   CREATE FUNCTION public.mark_as_read() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE message_status 
    SET is_read = TRUE 
    WHERE message_id = NEW.message_id AND user_id = NEW.user_id;
    RETURN NEW;
END;
$$;
 %   DROP FUNCTION public.mark_as_read();
       public               postgres    false            �            1255    25180    move_to_trash()    FUNCTION     �   CREATE FUNCTION public.move_to_trash() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE message_folders
    SET folder = 'корзина'
    WHERE message_id = OLD.message_id AND user_id = OLD.user_id;
    RETURN OLD;
END;
$$;
 &   DROP FUNCTION public.move_to_trash();
       public               postgres    false            �            1259    25145    attachments    TABLE     �   CREATE TABLE public.attachments (
    id integer NOT NULL,
    message_id integer NOT NULL,
    file_path character varying(255) NOT NULL,
    file_type character varying(100),
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.attachments;
       public         heap r       postgres    false            �            1259    25144    attachments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.attachments_id_seq;
       public               postgres    false    224            d           0    0    attachments_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.attachments_id_seq OWNED BY public.attachments.id;
          public               postgres    false    223            �            1259    25127    message_folders    TABLE     �  CREATE TABLE public.message_folders (
    id integer NOT NULL,
    message_id integer NOT NULL,
    user_id integer NOT NULL,
    folder character varying(20) NOT NULL,
    CONSTRAINT message_folders_folder_check CHECK (((folder)::text = ANY ((ARRAY['входящие'::character varying, 'отправленные'::character varying, 'черновики'::character varying, 'корзина'::character varying, 'избранные'::character varying])::text[])))
);
 #   DROP TABLE public.message_folders;
       public         heap r       postgres    false            �            1259    25126    message_folders_id_seq    SEQUENCE     �   CREATE SEQUENCE public.message_folders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.message_folders_id_seq;
       public               postgres    false    222            e           0    0    message_folders_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.message_folders_id_seq OWNED BY public.message_folders.id;
          public               postgres    false    221            �            1259    25158    message_status    TABLE     �   CREATE TABLE public.message_status (
    id integer NOT NULL,
    message_id integer NOT NULL,
    user_id integer NOT NULL,
    is_read boolean DEFAULT false,
    is_deleted boolean DEFAULT false
);
 "   DROP TABLE public.message_status;
       public         heap r       postgres    false            �            1259    25157    message_status_id_seq    SEQUENCE     �   CREATE SEQUENCE public.message_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.message_status_id_seq;
       public               postgres    false    226            f           0    0    message_status_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.message_status_id_seq OWNED BY public.message_status.id;
          public               postgres    false    225            �            1259    25106    messages    TABLE     V  CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    subject character varying(255),
    body text NOT NULL,
    status character varying(20) DEFAULT 'не просмотрено'::character varying,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.messages;
       public         heap r       postgres    false            �            1259    25105    messages_id_seq    SEQUENCE     �   CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.messages_id_seq;
       public               postgres    false    220            g           0    0    messages_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;
          public               postgres    false    219            �            1259    25094    users    TABLE       CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    25093    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    218            h           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    217            �           2604    25148    attachments id    DEFAULT     p   ALTER TABLE ONLY public.attachments ALTER COLUMN id SET DEFAULT nextval('public.attachments_id_seq'::regclass);
 =   ALTER TABLE public.attachments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    224    224            �           2604    25130    message_folders id    DEFAULT     x   ALTER TABLE ONLY public.message_folders ALTER COLUMN id SET DEFAULT nextval('public.message_folders_id_seq'::regclass);
 A   ALTER TABLE public.message_folders ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    221    222    222            �           2604    25161    message_status id    DEFAULT     v   ALTER TABLE ONLY public.message_status ALTER COLUMN id SET DEFAULT nextval('public.message_status_id_seq'::regclass);
 @   ALTER TABLE public.message_status ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    225    226            �           2604    25109    messages id    DEFAULT     j   ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);
 :   ALTER TABLE public.messages ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219    220            �           2604    25097    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    218    218            [          0    25145    attachments 
   TABLE DATA           X   COPY public.attachments (id, message_id, file_path, file_type, uploaded_at) FROM stdin;
    public               postgres    false    224   ;J       Y          0    25127    message_folders 
   TABLE DATA           J   COPY public.message_folders (id, message_id, user_id, folder) FROM stdin;
    public               postgres    false    222   �J       ]          0    25158    message_status 
   TABLE DATA           V   COPY public.message_status (id, message_id, user_id, is_read, is_deleted) FROM stdin;
    public               postgres    false    226   7K       W          0    25106    messages 
   TABLE DATA           ^   COPY public.messages (id, sender_id, receiver_id, subject, body, status, sent_at) FROM stdin;
    public               postgres    false    220   mK       U          0    25094    users 
   TABLE DATA           J   COPY public.users (id, username, email, password, created_at) FROM stdin;
    public               postgres    false    218   oL       i           0    0    attachments_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.attachments_id_seq', 3, true);
          public               postgres    false    223            j           0    0    message_folders_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.message_folders_id_seq', 16, true);
          public               postgres    false    221            k           0    0    message_status_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.message_status_id_seq', 4, true);
          public               postgres    false    225            l           0    0    messages_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.messages_id_seq', 4, true);
          public               postgres    false    219            m           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 3, true);
          public               postgres    false    217            �           2606    25151    attachments attachments_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.attachments DROP CONSTRAINT attachments_pkey;
       public                 postgres    false    224            �           2606    25133 $   message_folders message_folders_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.message_folders
    ADD CONSTRAINT message_folders_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.message_folders DROP CONSTRAINT message_folders_pkey;
       public                 postgres    false    222            �           2606    25165 "   message_status message_status_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.message_status
    ADD CONSTRAINT message_status_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.message_status DROP CONSTRAINT message_status_pkey;
       public                 postgres    false    226            �           2606    25115    messages messages_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_pkey;
       public                 postgres    false    220            �           2606    25104    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    218            �           2606    25100    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    218            �           2606    25102    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public                 postgres    false    218            �           2620    25177 #   messages trigger_distribute_folders    TRIGGER     �   CREATE TRIGGER trigger_distribute_folders AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.distribute_message_folders();
 <   DROP TRIGGER trigger_distribute_folders ON public.messages;
       public               postgres    false    227    220            �           2620    25179 #   message_status trigger_mark_as_read    TRIGGER     �   CREATE TRIGGER trigger_mark_as_read AFTER UPDATE ON public.message_status FOR EACH ROW WHEN ((new.is_read = true)) EXECUTE FUNCTION public.mark_as_read();
 <   DROP TRIGGER trigger_mark_as_read ON public.message_status;
       public               postgres    false    228    226    226            �           2620    25181 %   message_folders trigger_move_to_trash    TRIGGER     �   CREATE TRIGGER trigger_move_to_trash BEFORE DELETE ON public.message_folders FOR EACH ROW EXECUTE FUNCTION public.move_to_trash();
 >   DROP TRIGGER trigger_move_to_trash ON public.message_folders;
       public               postgres    false    229    222            �           2606    25214 '   attachments attachments_message_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.attachments DROP CONSTRAINT attachments_message_id_fkey;
       public               postgres    false    220    224    4786            �           2606    25204 /   message_folders message_folders_message_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message_folders
    ADD CONSTRAINT message_folders_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.message_folders DROP CONSTRAINT message_folders_message_id_fkey;
       public               postgres    false    4786    220    222            �           2606    25209 ,   message_folders message_folders_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message_folders
    ADD CONSTRAINT message_folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY public.message_folders DROP CONSTRAINT message_folders_user_id_fkey;
       public               postgres    false    4782    222    218            �           2606    25219 -   message_status message_status_message_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message_status
    ADD CONSTRAINT message_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.message_status DROP CONSTRAINT message_status_message_id_fkey;
       public               postgres    false    4786    220    226            �           2606    25224 *   message_status message_status_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message_status
    ADD CONSTRAINT message_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.message_status DROP CONSTRAINT message_status_user_id_fkey;
       public               postgres    false    4782    218    226            �           2606    25121 "   messages messages_receiver_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_receiver_id_fkey;
       public               postgres    false    220    4782    218            �           2606    25116     messages messages_sender_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_sender_id_fkey;
       public               postgres    false    218    220    4782            [   Y   x�3�4�t��-N-*��.���%�����zY霙���� ����������������������������5�1�4��11z\\\ ��9^      Y   �   x�}�A
�PD������Z��aDpQ��*R,��
������fx�v\�������/'.\t����Y8�+?�Ҟ����|LUٸ�H�~�V�=u���GTg������|u�x1�/�oF�룍W�N)�??(��      ]   &   x�3�4�4�L�L�2҆`�1'�X&�&P�=... ���      W   �   x���MN1�מSx��(?mEgÊ��04�� �
A{�01���|#X��E"?���[��[9ŀIB�KMw��� ]͸A��	;�C�+�M�����;h�4��7�?u3��5�_4˥�W9eZ:>j�_�m���{e_i�X�Rp���%(�^��~���T���F$\+�����+��Q�1�J�#����5�kaF��K���(s�A�����f<�
b�C��m���?i��z&X�      U   d   x�3��M�.����S�鹉�9z���0)##S]c]#C+C+c3=KK#C3#.#N����D�<0��*�G�1�OjQ"g�@�ã+F��� `�0A     