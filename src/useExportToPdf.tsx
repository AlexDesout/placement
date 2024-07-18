import { useCallback } from "react";
import { useReactFlow } from "reactflow";
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";

const useExportToPdf = (reactFlowWrapper, setIsExporting) => {
  const instance = useReactFlow();

  const exportToPDF = useCallback(() => {
    if (reactFlowWrapper.current) {
      setIsExporting(true);

      // Find nodes with IDs similar to 'table-1'
      const targetNodes = instance
        .getNodes()
        .filter((node) => node.id.includes("table-1"));

      if (targetNodes.length > 0) {
        // Calculate the center position
        const xPos =
          targetNodes.reduce((acc, node) => acc + node.position.x, 0) /
          targetNodes.length;
        const yPos =
          targetNodes.reduce((acc, node) => acc + node.position.y, 0) /
          targetNodes.length;

        // Adjust the viewport to center on the target position
        instance.setViewport({
          x: xPos - instance.viewport.width / 2,
          y: yPos - instance.viewport.height / 2,
          zoom: 1,
        });
      }

      // Delay the export slightly to ensure the viewport adjustment is rendered
      setTimeout(() => {
        htmlToImage
          .toPng(reactFlowWrapper.current)
          .then((dataUrl) => {
            const pdf = new jsPDF();
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Define the width and height you want for the image
            const imgWidth = pdfWidth * 0.9; // 90% of the page width
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            // Center the image
            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;

            pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
            pdf.save("react-flow.pdf");
            setIsExporting(false);
          })
          .catch((err) => {
            console.error("Could not export to PDF", err);
            setIsExporting(false);
          });
      }, 500); // Adjust this delay if necessary
    }
  }, [reactFlowWrapper, instance, setIsExporting]);

  return exportToPDF;
};

export default useExportToPdf;
