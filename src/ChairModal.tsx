import React, { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Remplacez '#root' par l'ID de l'élément racine de votre application

const ChairModal = ({
  isOpen,
  onRequestClose,
  node,
  guestsList,
  updateNode,
}) => {
  const [selectedGuest, setSelectedGuest] = useState(null);

  const handleGuestClick = (guest) => {
    setSelectedGuest(guest);
  };

  const handlePlaceClick = () => {
    if (selectedGuest) {
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          guestData: selectedGuest,
        },
      };
      updateNode(updatedNode);
      console.log(`Placed ${selectedGuest}`);
      console.log(updatedNode);
      // Réinitialiser la sélection après placement
      setSelectedGuest(null);
      onRequestClose(); // Fermer la modal après placement
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Chair Details"
    >
      <h2>Guest placement</h2>
      <div>
        {guestsList.map((guest) => (
          <p
            key={guest.name}
            onClick={() => handleGuestClick(guest)}
            style={{
              cursor: "pointer",
              backgroundColor: selectedGuest === guest ? "lightblue" : "white",
            }}
          >
            {guest.name}
          </p>
        ))}
      </div>
      <button onClick={onRequestClose}>Close</button>
      <button onClick={handlePlaceClick}>Placer</button>
    </Modal>
  );
};

export default ChairModal;
