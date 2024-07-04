import React, { useEffect, useState } from "react";
import { Paragraph } from "@contentful/f36-components";
import { SidebarAppSDK } from "@contentful/app-sdk";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  // Retrieve the field you set your validation
  const validationField = sdk.entry.fields["validation"].getValue();
  // Retrieve the field you wish to check 
  const richTextField = sdk.entry.fields["title"].getValue();
  const [valid, isValid] = useState<boolean>(validationField);

  console.log("Validation State", valid);

  useEffect(() => {
    // This checks the node types, please adjust if you have other node types such as embedded entries, etc.
    const checkForHtml = (content: any) => {
      return content.some(node => {
        if (node.nodeType === 'text' && /<[^>]+>/.test(node.value)) {
          return true;
        }
        if (node.content && Array.isArray(node.content)) {
          return checkForHtml(node.content);
        }
        return false;
      });
    };

    // Cleanup
    const unsubscribe = sdk.entry.fields["title"].onValueChanged((value) => {
      console.log("Rich text field changed:", value);
      const containsHtml = checkForHtml(value.content);
      isValid(!containsHtml);
    });


    if (valid === true) {
      sdk.entry.fields["validation"].setValue("true");
    } else {
      sdk.entry.fields["validation"].setValue("false");
    }

    return () => unsubscribe();
  }, [richTextField]);

  return (
    <Paragraph>
      {valid
        ? "Looks good to publish!"
        : "The Rich Text Field currently contains HTML, please remove it before publishing!"}
    </Paragraph>
  );
};

export default Sidebar;
